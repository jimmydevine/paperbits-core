import * as ko from "knockout";
import template from "./calendlyCalendlyButtonEditor.html";
import { StyleService } from "@paperbits/styles";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { CalendlyButtonModel } from "../calendlyCalendlyButtonModel";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { LocalStyles } from "@paperbits/common/styles";


@Component({
    selector: "calendlyCalendlyButton-editor",
    template: template
})
export class CalendlyButtonEditor {
    public readonly label: ko.Observable<string>;
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Observable<string>;
    public readonly appearanceStyle: ko.Observable<string>;
    public readonly appearanceStyles: ko.ObservableArray<any>;

    constructor(private readonly styleService: StyleService) {
        this.label = ko.observable<string>();
        this.appearanceStyles = ko.observableArray();
        this.appearanceStyle = ko.observable();
        this.hyperlink = ko.observable<HyperlinkModel>();
        this.hyperlinkTitle = ko.observable<string>();
    }

    @Param()
    public model: CalendlyButtonModel;

    @Event()
    public onChange: (model: CalendlyButtonModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.label(this.model.label);

        if (this.model.styles) {
            const variations = await this.styleService.getComponentVariations("calendlyCalendlyButton");
            this.appearanceStyles(variations.filter(x => x.category === "appearance"));
            this.appearanceStyle(<string>this.model.styles?.appearance);
        }

        this.hyperlink(this.model.hyperlink);
        this.onHyperlinkChange(this.model.hyperlink);

        this.appearanceStyle.subscribe(this.applyChanges);
        this.label.subscribe(this.applyChanges);
        this.hyperlink.subscribe(this.applyChanges);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        if (hyperlink) {
            this.hyperlinkTitle(hyperlink.title);
            this.hyperlink(hyperlink);
        }
        else {
            this.hyperlinkTitle("Add a link...");
        }
    }

    public onRoleSelect(roles: string[]): void {
        this.model.roles = roles;
        this.applyChanges();
    }

    private applyChanges(): void {
        this.model.label = this.label();
        this.model.hyperlink = this.hyperlink();
        this.model.styles = {
            appearance: this.appearanceStyle()
        };

        this.onChange(this.model);
    }
}