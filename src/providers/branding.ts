import {Inject, Injectable} from "@angular/core";

interface BrandObject {
    assets_folder: string;
    ilias_id: number;
}

const brands: { [key: string]: BrandObject; } = {
    "vanilla": {assets_folder: "vanilla", ilias_id: 7},
    "branded": {assets_folder: "branded", ilias_id: undefined}
};

@Injectable()
export class BrandingProvider {
    private static staticInstance: BrandingProvider = undefined;
    private readonly selectedBrand: string = "branded";

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
