import * as ko from "knockout";
import template from "./map-runtime.html";
import { Component, Param, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";


@RuntimeComponent({
    selector: "map-runtime"
})
@Component({
    selector: "map-runtime",
    template: template
})
export class MapRuntime {
    constructor() {
        this.caption = ko.observable();
        this.layout = ko.observable();
        this.location = ko.observable();
        this.zoomControl = ko.observable();
    }

    @Param()
    public caption: ko.Observable<string>;

    @Param()
    public layout: ko.Observable<string>;

    @Param()
    public location: ko.Observable<string>;

    @Param()
    public zoomControl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        //
    }
}