import { IViewModelBinder } from "@paperbits/common/widgets/IViewModelBinder";
import { PlaceholderModel } from "@paperbits/common/widgets/placeholder";
import { PlaceholderViewModel } from "./placeholderViewModel";

export class PlaceholderViewModelBinder implements IViewModelBinder<PlaceholderModel, PlaceholderViewModel> {
    public modelToViewModel(model: PlaceholderModel): PlaceholderViewModel {
        return new PlaceholderViewModel(model.message);
    }
    public canHandleModel(model: PlaceholderModel): boolean {
        return model instanceof PlaceholderModel;
    }
}