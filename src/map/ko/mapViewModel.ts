import * as ko from "knockout";
import template from "./map.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";

@Component({
    selector: "paperbits-googleMaps",
    template: template
})
export class MapViewModel {
    public runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}