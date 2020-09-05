import * as ko from "knockout";
import template from "./mediaSelector.html";
import * as Utils from "@paperbits/common/utils";
import { MediaItem } from "./mediaItem";
import { IMediaService, MediaContract } from "@paperbits/common/media";
import { ViewManager } from "@paperbits/common/ui";
import { EventManager } from "@paperbits/common/events";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { IWidgetService } from "@paperbits/common/widgets";
import { HyperlinkModel } from "@paperbits/common/permalinks/hyperlinkModel";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { Query, Operator } from "@paperbits/common/persistence";

@Component({
    selector: "media-selector",
    template: template
})
export class MediaSelector {
    private nextPageQuery: Query<MediaContract>;
    
    public readonly searchPattern: ko.Observable<string>;
    public readonly mediaItems: ko.ObservableArray<MediaItem>;
    public readonly working: ko.Observable<boolean>;

    @Param()
    public selectedMedia: ko.Observable<MediaItem>;

    @Param()
    public mimeType: string;

    @Event()
    public onSelect: (media: MediaContract) => void;

    @Event()
    public onHyperlinkSelect: (selection: HyperlinkModel) => void;

    constructor(
        private readonly eventManager: EventManager,
        private readonly mediaService: IMediaService,
        private readonly viewManager: ViewManager,
        private readonly widgetService: IWidgetService
    ) {
        this.mediaItems = ko.observableArray<MediaItem>();
        this.selectedMedia = ko.observable<MediaItem>();
        this.searchPattern = ko.observable<string>();
        this.working = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.searchMedia();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchMedia);
    }

    private async searchMedia(searchPattern: string = ""): Promise<void> {
        this.mediaItems([]);

        let query = Query
            .from<MediaContract>()
            .orderBy("fileName");

        if (searchPattern) {
            query = query.where("fileName", Operator.contains, searchPattern);
        }

        this.nextPageQuery = query;
        await this.loadNextPage();
    }

    public async loadNextPage(): Promise<void> {
        if (!this.nextPageQuery || this.working()) {
            return;
        }

        this.working(true);

        const pageOfResults = await this.mediaService.search2(this.nextPageQuery);
        this.nextPageQuery = pageOfResults.nextPage;

        const mediaItems = pageOfResults.value.map(page => new MediaItem(page));
        this.mediaItems.push(...mediaItems);

        this.working(false);
    }


    public selectMedia(media: MediaItem): void {
        this.selectedMedia(media);

        if (this.onSelect) {
            this.onSelect(media.toMedia());
        }

        if (this.onHyperlinkSelect) {
            this.onHyperlinkSelect(media.getHyperlink());
        }
    }

    public selectResource(resource: HyperlinkModel): void {
        this.preSelectedModel = resource;
    }

    public selectNone(): void {
        this.selectedMedia(undefined);
        if (this.onSelect) {
            this.onSelect(null);
        }
    }

    public onMediaUploaded(): void {
        this.searchMedia();
    }

    public async uploadMedia(): Promise<void> {
        const files = await this.viewManager.openUploadDialog();

        this.working(true);

        const uploadPromises = [];

        for (const file of files) {
            const content = await Utils.readFileAsByteArray(file);
            const uploadPromise = this.mediaService.createMedia(file.name, content, file.type);

            this.viewManager.notifyProgress(uploadPromise, "Media library", `Uploading ${file.name}...`);
            uploadPromises.push(uploadPromise);
        }

        const results = await Promise.all<MediaContract>(uploadPromises);
        await this.searchMedia();

        const mediaItem = new MediaItem(results[0]);
        this.selectMedia(mediaItem);

        this.working(false);
    }

    public onDragStart(item: MediaItem): HTMLElement {
        item.widgetFactoryResult = item.widgetOrder.createWidget();

        const widgetElement = item.widgetFactoryResult.element;
        const widgetModel = item.widgetFactoryResult.widgetModel;
        const widgetBinding = item.widgetFactoryResult.widgetBinding;

        this.viewManager.beginDrag({
            sourceModel: widgetModel,
            sourceBinding: widgetBinding
        });

        return widgetElement;
    }

    public onDragEnd(item: MediaItem): void {
        item.widgetFactoryResult.element.remove();
        const dragSession = this.viewManager.getDragSession();
        const acceptorBinding = dragSession.targetBinding;

        if (acceptorBinding && acceptorBinding.handler) {
            const widgetHandler = this.widgetService.getWidgetHandler(acceptorBinding.handler);
            widgetHandler.onDragDrop(dragSession);
        }

        this.eventManager.dispatchEvent("virtualDragEnd");
    }

    public isSelected(media: MediaItem): boolean {
        const selectedMedia = this.selectedMedia();
        return selectedMedia?.key === media.key;
    }
}