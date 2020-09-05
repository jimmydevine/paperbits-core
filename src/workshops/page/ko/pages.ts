import * as ko from "knockout";
import template from "./pages.html";
import { IPageService, PageContract } from "@paperbits/common/pages";
import { Router } from "@paperbits/common/routing";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { PageItem } from "./pageItem";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { Query, Operator } from "@paperbits/common/persistence";


@Component({
    selector: "pages",
    template: template
})
export class PagesWorkshop {
    private nextPageQuery: Query<PageContract>;

    public readonly searchPattern: ko.Observable<string>;
    public readonly pages: ko.ObservableArray<PageItem>;
    public readonly working: ko.Observable<boolean>;
    public readonly selectedPage: ko.Observable<PageItem>;

    constructor(
        private readonly pageService: IPageService,
        private readonly viewManager: ViewManager
    ) {
        this.pages = ko.observableArray<PageItem>();
        this.selectedPage = ko.observable<PageItem>();
        this.searchPattern = ko.observable<string>("");
        this.working = ko.observable(true);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchPages();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchPages);
    }

    private async searchPages(searchPattern: string = ""): Promise<void> {
        this.working(true);
        this.pages([]);

        const query = Query
            .from<PageContract>()
            .orderBy(`title`);

        if (searchPattern) {
            query.where(`title`, Operator.contains, searchPattern);
        }

        const pages = await this.pageService.search2(query);
        this.nextPageQuery = pages.nextPage;
        const pageItems = pages.value.map(page => new PageItem(page));

        this.pages.push(...pageItems);
        this.working(false);
    }

    public async loadNextPage(): Promise<void> {
        const pages = await this.pageService.search2(this.nextPageQuery);
        this.nextPageQuery = pages.nextPage;
        const pageItems = pages.value.map(page => new PageItem(page));

        this.pages.push(...pageItems);
    }

    public selectPage(pageItem: PageItem): void {
        this.selectedPage(pageItem);

        const view: View = {
            heading: "Page",
            component: {
                name: "page-details-workshop",
                params: {
                    pageItem: pageItem,
                    onDeleteCallback: () => {
                        this.searchPages();
                    },
                    onCopyCallback: async (item: PageItem) => {
                        await this.searchPages();
                        this.selectPage(item);
                    }
                }
            }
        };

        this.viewManager.openViewAsWorkshop(view);
    }

    public async addPage(): Promise<void> {
        this.working(true);

        const pageUrl = "/new";

        const pageContract = await this.pageService.createPage(pageUrl, "New page", "", "");
        const pageItem = new PageItem(pageContract);

        this.pages.push(pageItem);
        this.selectPage(pageItem);

        this.working(false);
    }

    public isSelected(page: PageItem): boolean {
        const selectedPage = this.selectedPage();
        return selectedPage?.key === page.key;
    }
}