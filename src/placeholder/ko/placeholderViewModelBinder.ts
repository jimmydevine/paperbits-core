import { ViewModelBinder } from "@paperbits/common/widgets/IViewModelBinder";
import { PlaceholderModel } from "@paperbits/common/widgets/placeholder";
import { PlaceholderViewModel } from "./placeholderViewModel";

export class PlaceholderViewModelBinder implements ViewModelBinder<PlaceholderModel, PlaceholderViewModel> {
    public async modelToViewModel(model: PlaceholderModel): Promise<PlaceholderViewModel> {
       const viewModel = new PlaceholderViewModel(model.displayName);

        const binding = {
            displayName: model.displayName,
            readonly: false,
            name: "placeholder",
            model: model,
            draggable: true
        };

        viewModel["widgetBinding"] = binding;

        return viewModel;
    }

    public canHandleModel(model: PlaceholderModel): boolean {
        return model instanceof PlaceholderModel;
    }
}