import { BaseType, Selection } from "d3-selection";
import { HierarchyRectangularNode } from "d3-hierarchy";
import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import IInteractiveBehavior = interactivityBaseService.IInteractiveBehavior;
import IInteractivityService = interactivityBaseService.IInteractivityService;
import ISelectionHandler = interactivityBaseService.ISelectionHandler;
import SelectableDataPoint = interactivitySelectionService.SelectableDataPoint;
import IBehaviorOptions = interactivityBaseService.IBehaviorOptions;
import { SunburstDataPoint } from "./dataInterfaces";
export interface BehaviorOptions extends IBehaviorOptions<SunburstDataPoint> {
    selection: Selection<BaseType, HierarchyRectangularNode<SunburstDataPoint>, BaseType, SunburstDataPoint>;
    clearCatcher: Selection<BaseType, any, BaseType, any>;
    interactivityService: IInteractivityService<SelectableDataPoint>;
    onSelect?: (dataPoint: SunburstDataPoint) => void;
}
export declare class Behavior implements IInteractiveBehavior {
    private options;
    bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void;
    renderSelection(hasSelection: boolean): void;
}
