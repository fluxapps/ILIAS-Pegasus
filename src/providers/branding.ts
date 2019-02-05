import {Inject, Injectable} from "@angular/core";

interface BrandObject {
    assets_folder: string;
    ilias_id: number;
}

const brands: { [key: string]: BrandObject; } = {
    "vanilla": {assets_folder: "vanilla", ilias_id: undefined},
    "urversity": {assets_folder: "branded_urversity", ilias_id: undefined},
    "zwh": {assets_folder: "branded_zwh", ilias_id: undefined},
    "fhaachen": {assets_folder: "branded_fhaachen", ilias_id: undefined},
    "mfkjusb": {assets_folder: "branded_mfkjusb", ilias_id: undefined}
};

@Injectable()
export class BrandingProvider {
    private static staticInstance: BrandingProvider = undefined;
    private readonly selectedBrand: string = "zwh";

    static instance(): BrandingProvider {
        if (!BrandingProvider.staticInstance)
            BrandingProvider.staticInstance = new BrandingProvider();
        return BrandingProvider.staticInstance;
    }

    getAsset(file: string): string {
        return `assets/${brands[this.selectedBrand].assets_folder}/${file}`;
    }

    getILIASInstallationId(): number {
        return brands[this.selectedBrand].ilias_id;
    }

}
