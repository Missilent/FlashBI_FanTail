import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IViewport = powerbi.IViewport;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
export declare class Visual implements IVisual {
    allowInteractions: boolean;
    private rootElement;
    private headNodes;
    private bodyNodes;
    private settings;
    private host;
    private selectionManager;
    private div;
    private svg;
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
    private renderContextMenu;
}
