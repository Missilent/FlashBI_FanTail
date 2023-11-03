/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import { formattingService } from "powerbi-visuals-utils-formattingutils";
import VisualEnumerationInstanceKinds = powerbiVisualsApi.VisualEnumerationInstanceKinds;  
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import { VisualSettings } from "./settings";
import { parseElement, resetInjector, runHTMLWidgetRenderer } from "./htmlInjectionUtility";
import powerbiVisualsApi from "powerbi-visuals-api";

import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewObjects = powerbi.DataViewObjects;
import Fill = powerbi.Fill;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;


import { TooltipEventArgs, createTooltipServiceWrapper, ITooltipServiceWrapper,
     TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";
import { textMeasurementService, valueFormatter } from "powerbi-visuals-utils-formattingutils";

//import { getValue, getCategoricalObjectValue } from "./objectEnumerationUtility";
//import { getLocalizedString } from "./localization/localizationHelper"
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import { BaseType, Selection, select as d3Select } from "d3-selection";



import DataViewHierarchyLevel = powerbiVisualsApi.DataViewHierarchyLevel;

import DataViewObjectPropertyIdentifier = powerbiVisualsApi.DataViewObjectPropertyIdentifier;
import DataViewTreeNode = powerbiVisualsApi.DataViewTreeNode;

import ISelectionIdBuilder = powerbiVisualsApi.visuals.ISelectionIdBuilder;


import IColorPalette = powerbiVisualsApi.extensibility.IColorPalette;

import IVisualEventService = powerbiVisualsApi.extensibility.IVisualEventService;
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { pixelConverter as PixelConverter } from "powerbi-visuals-utils-typeutils";


import {
    CssConstants,
    manipulation
} from "powerbi-visuals-utils-svgutils";
import translate = manipulation.translate;
import ClassAndSelector = CssConstants.ClassAndSelector;
import createClassAndSelector = CssConstants.createClassAndSelector;

import IValueFormatter = valueFormatter.IValueFormatter;

import {
    legend as Legend,
    legendInterfaces as LI
} from "powerbi-visuals-utils-chartutils";
import createLegend = Legend.createLegend;
import ILegend = LI.ILegend;
import LegendData = LI.LegendData;
import MarkerShape = LI.MarkerShape;
import LegendPosition = LI.LegendPosition;

import { interactivityBaseService, interactivitySelectionService } from "powerbi-visuals-utils-interactivityutils";
import IInteractivityService = interactivityBaseService.IInteractivityService;
import IInteractiveBehavior = interactivityBaseService.IInteractiveBehavior;
import createInteractivitySelectionService = interactivitySelectionService.createInteractivitySelectionService;

import { Behavior, BehaviorOptions } from "./behavior";
import { SunburstData, SunburstDataPoint } from "./dataInterfaces";
import { SunburstSettings } from "./settings";
//import { identity } from "lodash";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";



let bodyElement = d3.select("body");

let element = bodyElement
    .append("div")
    .classed("visual", true)
    .data([{
        tooltipInfo: [{
            displayName: "Power BI",
            value: 2016
        }]
    }]);



// You will see a tooltip if you mouseover the element.


// External dependencies
import * as d3 from 'd3';

enum VisualUpdateType {
    Data = 2,
    Resize = 4,
    ViewMode = 8,
    Style = 16,
    ResizeEnd = 32,
    All = 62,
}




// in order to improve the performance, one can update the <head> only in the initial rendering.
// set to 'true' if you are using different packages to create the widgets
const updateHTMLHead: boolean = false;
const renderVisualUpdateType: number[] = [
    VisualUpdateType.Resize,
    VisualUpdateType.ResizeEnd,
    VisualUpdateType.Resize + VisualUpdateType.ResizeEnd
];

//export interface IFilter {
 //   $schema: string;
 //   operator: BasicFilterOperators;
 //   values: (string | number | boolean)[];
//}

export class Visual implements IVisual {
    allowInteractions: boolean;
    private rootElement: HTMLElement;
    private headNodes: Node[];
    private bodyNodes: Node[];
    private settings: VisualSettings;
    private target: HTMLElement;
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private div: HTMLDivElement;
    private visualHost: IVisualHost;


    //let selectionManager = this.selectionManager;
   // let allowInteractions = this.host.allowInteractions;

// FROM SUNBURST
    private data: SunburstData;
    private events: IVisualEventService;
    private colorPalette: IColorPalette;
    private colorHelper: ColorHelper;
    private percentageFormatter: IValueFormatter;
    private interactivityService: IInteractivityService<any>;
    private behavior: IInteractiveBehavior = new Behavior();
    
    private tooltipService: ITooltipServiceWrapper;
    private viewport: IViewport;
    private legend: ILegend;
    private legendData: LegendData;
    private chartWrapper: Selection<BaseType, any, BaseType, any>;
    private svg: Selection<BaseType, string, BaseType, string>;
    private static LegendPropertyIdentifier: DataViewObjectPropertyIdentifier = {
        objectName: "group",
        propertyName: "fill"
    };

///////////////

    public constructor(options: VisualConstructorOptions) {
        // save the host in the visuals properties

  
        // ...

        this.host = options.host;
        this.events = options.host.eventService;
        // create selection manager
        this.selectionManager = this.host.createSelectionManager();
        if (options && options.element) {
            this.rootElement = options.element;
        }
        this.headNodes = [];
        this.bodyNodes = [];
     
        this.tooltipService = createTooltipServiceWrapper(
            options.host.tooltipService,
            options.element
        );
        this.percentageFormatter = valueFormatter.create({ format: "0.00%;-0.00%;0.00%" });

        this.interactivityService = createInteractivitySelectionService(options.host);
        
       createTooltipServiceWrapper(
           options.host.tooltipService,
           options.element);

            // FROM SUNBURST

            this.visualHost = options.host;

            this.events = options.host.eventService;
    
            this.tooltipService = createTooltipServiceWrapper(
                options.host.tooltipService,
               options.element
           );
    
           this.percentageFormatter = valueFormatter.create({ format: "0.00%;-0.00%;0.00%" });
    
          this.colorPalette = this.visualHost.colorPalette;
          this.colorHelper = new ColorHelper(this.colorPalette);
            //this.arc = d3Arc<HierarchyRectangularNode<SunburstDataPoint>>()
             //   .startAngle(d => d.x0)
             //   .endAngle(d => d.x1)
              //  .innerRadius((d) => Math.sqrt(d.y0))
              //  .outerRadius((d) => Math.sqrt(d.y1));
    
            this.colorPalette = options.host.colorPalette;
    
            this.interactivityService = createInteractivitySelectionService(options.host);
    
            //this.chartWrapper = d3Select(options.element)
            //   .append("div")
             //  .classed(this.appCssConstants.main.className, true);
    
           // this.svg = this.chartWrapper
           //     .append("svg")
           //     .attr("viewBox", `0 0 ${Sunburst.ViewBoxSize} ${Sunburst.ViewBoxSize}`)
           //     .attr("width", "100%")
            ///    .attr("height", "100%")
            //    .attr("preserveAspectRatio", "xMidYMid meet");
    
            this.selectionManager = options.host.createSelectionManager();
    
            //this.main = this.svg.append("g");
            //this.main.attr(CssConstants.transformProperty, translate(Sunburst.CentralPoint, Sunburst.CentralPoint));
    
            //this.selectedCategoryLabel = this.svg
            //    .append("text")
             //   .classed(this.appCssConstants.label.className, true)
             //   .classed(this.appCssConstants.categoryLabel.className, true);
    
            //this.selectedCategoryLabel.attr("x", Sunburst.CentralPoint);
            //this.selectedCategoryLabel.attr("y", Sunburst.CentralPoint);
    
            //this.percentageLabel = this.svg
            //    .append("text")
            //    .classed(this.appCssConstants.label.className, true)
             //   .classed(this.appCssConstants.percentageLabel.className, true);
            //this.percentageLabel.attr("x", Sunburst.CentralPoint);
           // this.percentageLabel.attr("y", Sunburst.CentralPoint);
    
     // NO ???? this.renderContextMenu();
    
     

         
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {        let dataCard: powerbi.visuals.FormattingCard = {
        description: "FlashBI",
        displayName: "FlashBI",
        uid: "FlashBI_uid",
        groups: []}
          // Build and return formatting model with data card
          const formattingModel: powerbi.visuals.FormattingModel = { cards: [dataCard] };
          return formattingModel;
    }

    

    public update(options: VisualUpdateOptions): void {

        if (!options ||
            !options.type ||
            !options.viewport ||
            !options.dataViews ||
            options.dataViews.length === 0 ||
            !options.dataViews[0]) {
            return;
        }
     
        const dataView: DataView = options.dataViews[0];
        this.settings = Visual.parseSettings(dataView);

        let payloadBase64: string = null;
        if (dataView.scriptResult && dataView.scriptResult.payloadBase64) {
            payloadBase64 = dataView.scriptResult.payloadBase64;
        }

        if (renderVisualUpdateType.indexOf(options.type) === -1) {
            if (payloadBase64) {
                this.injectCodeFromPayload(payloadBase64);
            }
        } else {
            this.onResizing(options.viewport);
        }
        let selectionManager = this.selectionManager;

        
        let allowInteractions = this.allowInteractions;

        


    }

    public onResizing(finalViewport: IViewport): void {
        // tslint:disable-next-line
        /* add code to handle resizing of the view port */
    }

    private injectCodeFromPayload(payloadBase64: string): void {
        // inject HTML from payload, created in R
        // the code is injected to the 'head' and 'body' sections.
        // if the visual was already rendered, the previous DOM elements are cleared

        resetInjector();

        if (!payloadBase64) {
            return;
        }

        // create 'virtual' HTML, so parsing is easier
        let el: HTMLHtmlElement = document.createElement("html");
        try {
            // tslint:disable-next-line
            el.innerHTML = window.atob(payloadBase64);
        } catch (err) {
            return;
        }

        // if 'updateHTMLHead == false', then the code updates the header data only on the 1st rendering
        // this option allows loading and parsing of large and recurring scripts only once.
        if (updateHTMLHead || this.headNodes.length === 0) {
            while (this.headNodes.length > 0) {
                let tempNode: Node = this.headNodes.pop();
                document.head.removeChild(tempNode);
            }
            let headList: HTMLCollectionOf<HTMLHeadElement> = el.getElementsByTagName("head");
            if (headList && headList.length > 0) {
                let head: HTMLHeadElement = headList[0];
                this.headNodes = parseElement(head, document.head);
            }
        }

        // update 'body' nodes, under the rootElement
        while (this.bodyNodes.length > 0) {
            let tempNode: Node = this.bodyNodes.pop();
            this.rootElement.removeChild(tempNode);
        }
        let bodyList: HTMLCollectionOf<HTMLBodyElement> = el.getElementsByTagName("body");
        if (bodyList && bodyList.length > 0) {
            let body: HTMLBodyElement = bodyList[0];
            this.bodyNodes = parseElement(body, this.rootElement);
        }

        runHTMLWidgetRenderer();
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
        VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    } 


    private renderContextMenu() {
        this.svg.on('contextmenu', (event) => {
            let dataPoint: any = d3Select(event.target).datum();
           this.selectionManager.showContextMenu((dataPoint && dataPoint.data && dataPoint.data.identity) ? dataPoint.data.identity : {}, {
                x: event.clientX,
                y: event.clientY
            });
           event.preventDefault();
      });
    }


   
    

}