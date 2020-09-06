import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import template from "./urlSelector.html";
import { UrlItem } from "./urlItem";
import { IUrlService, UrlContract } from "@paperbits/common/urls";
import { Component, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { Query, Operator } from "@paperbits/common/persistence";

@Component({
    selector: "url-selector",
    template: template
})
export class UrlSelector {
    private nextPageQuery: Query<UrlContract>;

    public readonly searchPattern: ko.Observable<string>;
    public readonly urls: ko.ObservableArray<UrlItem>;
    public readonly uri: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly selectedUrl: ko.Observable<UrlItem>;

    constructor(private readonly urlService: IUrlService) {
        this.uri = ko.observable<string>("https://");
        this.urls = ko.observableArray();
        this.selectedUrl = ko.observable();
        this.searchPattern = ko.observable();
        this.working = ko.observable(false);
    }

    @Event()
    public onSelect: (selection: UrlContract) => void;

    @Event()
    public onHyperlinkSelect: (selection: UrlContract) => void;

    @OnMounted()
    public async onMounted(): Promise<void> {
        await this.searchUrls();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchUrls);
    }
    
    private async searchUrls(searchPattern: string = ""): Promise<void> {
        this.urls([]);

        let query = Query
            .from<UrlContract>()
            .orderBy("title");

        if (searchPattern) {
            query = query.where("title", Operator.contains, searchPattern);
        }

        this.nextPageQuery = query;
        await this.loadNextPage();
    }

    public async loadNextPage(): Promise<void> {
        if (!this.nextPageQuery || this.working()) {
            return;
        }

        this.working(true);

        await Utils.delay(2000);
        const pageOfResults = await this.urlService.search(this.nextPageQuery);
        this.nextPageQuery = pageOfResults.nextPage;

        const mediaItems = pageOfResults.value.map(url => new UrlItem(url));
        this.urls.push(...mediaItems);

        this.working(false);
    }

    public async selectUrl(urlItem: UrlItem): Promise<void> {
        const uri = this.selectedUrl();

        if (uri) {
            uri.hasFocus(false);
        }
        urlItem.hasFocus(true);
        this.selectedUrl(urlItem);

        if (this.onSelect) {
            this.onSelect(urlItem.toContract());
        }

        if (this.onHyperlinkSelect) {
            this.onHyperlinkSelect(urlItem.getHyperlink());
        }
    }

    public async createUrl(): Promise<void> {
        const newUri = this.uri();
        const urlContract = await this.urlService.createUrl(newUri, newUri);
        const urlItem = new UrlItem(urlContract);

        if (this.onHyperlinkSelect) {
            this.onHyperlinkSelect(urlItem.getHyperlink());
        }
    }

    public async deleteUrl(): Promise<void> {
        const uri = this.selectedUrl();

        if (uri) {
            await this.urlService.deleteUrl(uri.toContract());
        }
        this.uri("https://");
        await this.searchUrls();
    }
}