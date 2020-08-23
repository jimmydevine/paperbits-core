import { MapModel } from "./mapModel";
import { MapContract } from "./mapContract";
import { IModelBinder } from "@paperbits/common/editing";
import { Contract } from "@paperbits/common";

export class MapModelBinder implements IModelBinder<MapModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === "map";
    }

    public canHandleModel(model: Object): boolean {
        return model instanceof MapModel;
    }

    public async contractToModel(contract: MapContract): Promise<MapModel> {
        const model = new MapModel();
        model.caption = contract.caption;
        model.layout = contract.layout;
        model.location = contract.location;
        model.zoomControl = contract.zoomControl;
        model.styles = contract.styles || { appearance: "components/button/default" };

        return model;
    }

    public modelToContract(model: MapModel): MapContract {
        const contract: MapContract = {
            type: "map",
            caption: model.caption,
            layout: model.layout,
            location: model.location,
            zoomControl: model.zoomControl
        };

        return contract;
    }
}