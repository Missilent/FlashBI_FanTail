import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var fanTail2A78A07F2F3E421E9BB61C0CD7D005C0: IVisualPlugin = {
    name: 'fanTail2A78A07F2F3E421E9BB61C0CD7D005C0',
    displayName: 'Fan Tail by FlashBI',
    class: 'Visual',
    apiVersion: '5.4.0',
    create: (options?: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["fanTail2A78A07F2F3E421E9BB61C0CD7D005C0"] = fanTail2A78A07F2F3E421E9BB61C0CD7D005C0;
}
export default fanTail2A78A07F2F3E421E9BB61C0CD7D005C0;