import {Injectable} from "@angular/core";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {Settings} from "../../models/settings";
import {IconProvider} from "../../providers/theme/icon.provider";
import {Icon} from "ionicons/dist/types/icon/icon";
import {User} from "../../models/user";
import { FeaturePolicyService, Features } from "../policy/feature-policy.service";

@Injectable({
    providedIn: "root"
})
export class CssStyleService {
    customIsSet: boolean;
    customColorHex: string;
    customColorContrast: boolean;

    private colorNames: Array<string> = [
        "primary_shade",
        "primary_shade_rgb",
        "primary_normal",
        "primary_tint",
        "contrast_normal",
        "contrast_normal_rgb",
        "contrast_shade"
    ];

    private propertyNames: object = {
        "primary_shade" : [
            "--ion-color-primary-shade",
            "--ion-color-secondary-shade"
        ],
        "primary_shade_rgb" : [
            "--ion-color-primary-rgb",
            "--ion-color-secondary-rgb",
            "--ion-color-tertiary-contrast-rgb",
        ],
        "primary_normal": [
            "--ion-color-primary",
            "--ion-color-secondary",
            "--ion-color-tertiary-contrast"
        ],
        "primary_tint": [
            "--ion-color-primary-tint",
            "--ion-color-secondary-tint"
        ],
        "contrast_normal": [
            "--ion-color-primary-contrast",
            "--ion-color-secondary-contrast",
            "--ion-color-tertiary-tint"
        ],
        "contrast_normal_rgb": [
            "--ion-color-primary-contrast-rgb",
            "--ion-color-secondary-contrast-rgb",
            "--ion-color-tertiary-rgb"
        ],
        "contrast_shade" : [
            "--ion-color-tertiary-shade"
        ]
    };

    constructor(
        private readonly featurePolicy: FeaturePolicyService
    ) {}

    /**
     * checks whether the theme should be managed dynamically
     */
    dynamicThemeEnabled(): boolean {
        return this.featurePolicy.isFeatureAvailable(Features.CUSTOM_THEME);
    }

    /**
     * checks whether custom coloring is activated, reads the custom color
     * from settings and changes the css-colors accordingly
     */
    async setCustomColor(): Promise<void> {
        const themeCols: object = await this.getThemeColors();

        this.colorNames.forEach(colorName =>
            this.propertyNames[colorName].forEach(propertyName =>
                this.setCSSValue(propertyName, themeCols[colorName])
            )
        );

        this.customIsSet = true;
    }

    /**
     * sets the coloring according to the default settings in the scss-stylesheets
     */
    setDefaultColor(): void {
        this.colorNames.forEach(name =>
            this.propertyNames[name].forEach(property =>
                document.documentElement.style.removeProperty(property)
            )
        );

        this.customIsSet = false;
    }

    /**
     * reads a css-value from the root-element
     */
    private getCSSValue(name: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    /**
     * converts a css-value from the root-element to a boolean: if the value-string
     * contains true, return true, and false otherwise
     */
    private getCSSValueAsBoolean(name: string): boolean {
        return this.getCSSValue(name).includes("true");
    }

    /**
     * sets the value of a css-property in the root-element
     */
    private setCSSValue(name: string, value: string): void {
        document.documentElement.style.setProperty(name, value);
    }

    /**
     * loads the color-value from the settings-table. if no value is set,
     * returns current primary color
     */
    private getCustomColor(settings: Settings): string {
        const colSettings: string = settings.themeColorHex;
        const colCSS: string = this.getCSSValue("--ion-color-primary");
        return colSettings ? colSettings : colCSS;
    }

    /**
     * computes the colors of the theme, based on a custom primary color
     */
    private async getThemeColors(): Promise<object> {
        const settings: Settings = await AuthenticationProvider.getUser().settings;
        this.customColorHex =  this.getCustomColor(settings);
        this.customColorContrast = settings.themeContrastColor;

        function toRgbRange(v: number): number {
            return Math.max(0, Math.min(255, v));
        }

        const normal: Array<number> = this.hexToRgb(this.customColorHex);
        const shade: Array<number> = normal.map(v => toRgbRange(v - 12));
        const tint: Array<number> = normal.map(v => toRgbRange(v + 12), 255);

        const contrast: Array<number> =  this.customColorContrast ? [255, 255, 255] : [10, 10, 10];
        const cShade: Array<number> = this.customColorContrast ?
            contrast.map(v => toRgbRange(v - 40)) :
            contrast.map(v => toRgbRange(v + 40));

        return {
            "primary_shade" : this.rgbToHex(shade),
            "primary_shade_rgb" : `${shade[0]},${shade[1]},${shade[2]}`,
            "primary_normal": this.rgbToHex(normal),
            "primary_tint": this.rgbToHex(tint),
            "contrast_normal": this.rgbToHex(contrast),
            "contrast_normal_rgb": `${contrast[0]},${contrast[1]},${contrast[2]}`,
            "contrast_shade": this.rgbToHex(cShade)
        };
    }

    /**
     * converts the RGB-array [r, g, b] of a color to the HEX-string #******
     */
    private rgbToHex(rgb: Array<number>): string {
        function toTwoDigitHex(val: number): string {
            const hex: string = val.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        let hex: string = "#";
        rgb.forEach(v => hex += toTwoDigitHex(v));
        return hex;
    }

    /**
     * converts the HEX-string #****** of a color to the RGB-array [r, g, b]
     */
    private hexToRgb(hex: string): Array<number> {
        const rgb: Array<number> = [];

        for(let i: number = 1; i < hex.length; i += 2) {
            const hVal: string = `0x${hex[i]}${hex[i+1]}`;
            const val: number = parseInt(hVal, 16);
            rgb.push(val);
        }

        return rgb;
    }
}
