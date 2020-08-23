import { LocalStyles } from "@paperbits/common/styles";

export class MapModel {
    public location: string;
    public layout?: string;
    public caption?: string;
    public zoomControl?: string;
    public styles: LocalStyles;
}