import { TooltipEnabledDataPoint } from "powerbi-visuals-utils-tooltiputils";
import { interactivitySelectionService } from "powerbi-visuals-utils-interactivityutils";
import SelectableDataPoint = interactivitySelectionService.SelectableDataPoint;
export interface SunburstData {
    root: SunburstDataPoint;
    dataPoints: SunburstDataPoint[];
    total: number;
}
export interface SunburstDataPoint extends TooltipEnabledDataPoint, SelectableDataPoint {
    children?: SunburstDataPoint[];
    value?: number;
    color?: string;
    name?: string;
    parent?: SunburstDataPoint;
    total: number;
    key: string;
    highlight?: boolean;
    coords?: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
}
