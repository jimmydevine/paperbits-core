import { MapViewModel } from "./mapViewModel";
import { MapModel } from "../mapModel";
import { EventManager } from "@paperbits/common/events";
import { Bag } from "@paperbits/common";

export class MapViewModelBinder {
    constructor(private readonly eventManager: EventManager) { }

    public async modelToViewModel(model: MapModel, viewModel?: MapViewModel, bindingContext?: Bag<any>): Promise<MapViewModel> {
        if (!viewModel) {
            viewModel = new MapViewModel();
        }

        viewModel.runtimeConfig(JSON.stringify({
            caption: model.caption,
            layout: model.layout,
            location: model.location,
            zoomControl: model.zoomControl
        }));

        viewModel["widgetBinding"] = {
            displayName: "Map",
            readonly: bindingContext ? bindingContext.readonly : false,
            model: model,
            draggable: true,
            editor: "paperbits-map-editor",
            applyChanges: async () => {
                await this.modelToViewModel(model, viewModel, bindingContext);
                this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: MapModel): boolean {
        return model instanceof MapModel;
    }
}