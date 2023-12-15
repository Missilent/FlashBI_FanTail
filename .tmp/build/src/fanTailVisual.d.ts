import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IViewport = powerbi.IViewport;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
export declare class FanTailVisual implements IVisual {
    private svg;
    private host;
    private element;
    private selectionManager;
    private headNodes;
    private bodyNodes;
    private settings;
    constructor(options: VisualConstructorOptions);
    getFormattingModel(): powerbi.visuals.FormattingModel;
    update(options: VisualUpdateOptions): void;
    onResizing(finalViewport: IViewport): void;
    private injectCodeFromPayload;
    private static parseSettings;
    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject;
    private handleContextMenu;
}
