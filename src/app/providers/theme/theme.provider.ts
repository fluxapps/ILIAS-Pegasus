import {Injectable} from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import {IconProvider} from "./icon.provider";
import {ThemeSynchronizationService} from "../../services/theme/theme-synchronization.service";
import {CssStyleService} from "../../services/theme/css-style.service";
import {FeaturePolicyService} from "../../services/policy/feature-policy.service";

/**
 * this provider bundles together the functionality of the IconProvider,
 * the ThemeSynchronizationService and the CssStyleService
 */

@Injectable({
    providedIn: "root"
})
export class ThemeProvider {
    constructor(
        private readonly iconProvider: IconProvider,
        private readonly themeSynch: ThemeSynchronizationService,
        private readonly cssStyle: CssStyleService,
        private readonly featurePolicy: FeaturePolicyService
    ) {}

    async getIconSrc(key: string): Promise<string | SafeUrl> {
        return this.iconProvider.getIconSrc(key);
    }

    async setCustomColor(): Promise<void> {
        if(this.cssStyle.dynamicThemeEnabled() && await ThemeSynchronizationService.dynamicThemeAvailable()) {
            await this.cssStyle.setCustomColor();
        }
    }

    setDefaultColor(): void {
        this.cssStyle.setDefaultColor();
    }

    async loadResources(): Promise<void> {
        if (!this.featurePolicy.isFeatureAvailable("theme:custom")) return;

        await this.themeSynch.synchronize();
        await this.setCustomColor();
        await this.iconProvider.loadResources();
    }

    async synchronizeAndSetCustomTheme(): Promise<void> {
        if(!window.navigator.onLine) return;

        if(this.cssStyle.dynamicThemeEnabled()) {
            await this.themeSynch.synchronize();
            await this.setCustomColor();
        }
        await this.loadResources();
    }
}
