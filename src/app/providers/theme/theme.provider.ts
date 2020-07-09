import {Injectable} from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import {IconProvider} from "./icon.provider";
import {ThemeSynchronizationService} from "../../services/theme/theme-synchronization.service";
import {CssStyleService} from "../../services/theme/css-style.service";

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
    ) {}

    static getIconSrc(key: string): string | SafeUrl {
        return IconProvider.getIconSrc(key);
    }

    static async setCustomColor(): Promise<void> {
        if(CssStyleService.dynamicThemeEnabled() && await ThemeSynchronizationService.dynamicThemeAvailable()) {
            await CssStyleService.setCustomColor();
        }
    }

    static setDefaultColor(): void {
        CssStyleService.setDefaultColor();
    }

    async loadResources(): Promise<void> {
        await this.iconProvider.loadResources();
    }

    async synchronizeAndSetCustomTheme(): Promise<void> {
        if(!window.navigator.onLine) return;

        if(CssStyleService.dynamicThemeEnabled()) {
            await this.themeSynch.synchronize();
            await ThemeProvider.setCustomColor();
        }
        await this.loadResources();
    }
}
