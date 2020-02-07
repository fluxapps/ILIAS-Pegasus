import {Injectable} from "@angular/core";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {Settings} from "../../models/settings";
import {IconProvider} from "../../providers/theme/icon.provider";
import {Icon} from "ionicons/dist/types/icon/icon";

@Injectable({
    providedIn: "root"
})
export class CssStyleService {
    static customIsSet: boolean;
    static customColorHex: string;
    static customColorContrast: boolean;

    private static colorNames: Array<string> = [
        "primary_shade",
        "primary_shade_rgb",
        "primary_normal",
        "primary_tint",
        "contrast_normal",
        "contrast_normal_rgb",
        "contrast_shade"
    ];

    private static propertyNames: object = {
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

    /**
     * checks whether the theme should be managed dynamically
     */
    static dynamicThemeEnabled(): boolean {
        return CssStyleService.getCSSValueAsBoolean("--theme-from-plugin");
    }

    /**
     * checks whether custom coloring is activated, reads the custom color
     * from settings and changes the css- and csv-colors accordingly
     */
    static async setCustomColor(): Promise<void> {
        const themeCols: object = await CssStyleService.getThemeColors();

        CssStyleService.colorNames.forEach(colorName =>
            CssStyleService.propertyNames[colorName].forEach(propertyName =>
                CssStyleService.setCSSValue(propertyName, themeCols[colorName])
            )
        );

        CssStyleService.setCSVColors("tile-image", themeCols["primary_tint"]);
        CssStyleService.customIsSet = true;
    }

    /**
     * sets the coloring according to the default settings in the scss-stylesheets
     */
    static setDefaultColor(): void {
        CssStyleService.colorNames.forEach(name =>
            CssStyleService.propertyNames[name].forEach(property =>
                document.documentElement.style.removeProperty(property)
            )
        );

        CssStyleService.customIsSet = false;
    }

    /**
     * reads a css-value from the root-element
     */
    private static getCSSValue(name: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    /**
     * converts a css-value from the root-element to a boolean: if the value-string
     * contains true, return true, and false otherwise
     */
    private static getCSSValueAsBoolean(name: string): boolean {
        return CssStyleService.getCSSValue(name).includes("true");
    }

    /**
     * sets the value of a css-property in the root-element
     */
    private static setCSSValue(name: string, value: string): void {
        document.documentElement.style.setProperty(name, value);
    }

    /**
     * collects all CSV-images of the class className and changes the primary color
     */
    private static setCSVColors(className: string, hex: string): void {
        const svgs: HTMLCollection = document.getElementsByClassName(className);

        for (let i: number = 0; i < svgs.length; i++) {
            const e: any = svgs[i];
            const svgDoc: any = e.getSVGDocument();
            if(svgDoc != undefined) {
                const style: any = svgDoc.styleSheets[0];
                if(style != undefined) {
                    style.rules[0].style.fill = hex;
                }
            }
        }
    }

    /**
     * loads the color-value from the settings-table. if no value is set,
     * returns current primary color
     */
    private static getCustomColor(settings: Settings): string {
        const colSettings: string = settings.themeColorHex;
        const colCSS: string = CssStyleService.getCSSValue("--ion-color-primary");
        return colSettings ? colSettings : colCSS;
    }

    /**
     * computes the colors of the theme, based on a custom primary color
     */
    private static async getThemeColors(): Promise<object> {
        const settings: Settings = await AuthenticationProvider.getUser().settings;
        CssStyleService.customColorHex =  CssStyleService.getCustomColor(settings);
        CssStyleService.customColorContrast = settings.themeContrastColor;

        function toRgbRange(v: number): number {
            return Math.max(0, Math.min(255, v));
        }

        const normal: Array<number> = CssStyleService.hexToRgb(CssStyleService.customColorHex);
        const shade: Array<number> = normal.map(v => toRgbRange(v - 12));
        const tint: Array<number> = normal.map(v => toRgbRange(v + 12), 255);

        const contrast: Array<number> =  CssStyleService.customColorContrast ? [255, 255, 255] : [10, 10, 10];
        const cShade: Array<number> = CssStyleService.customColorContrast ?
            contrast.map(v => toRgbRange(v - 40)) :
            contrast.map(v => toRgbRange(v + 40));

        return {
            "primary_shade" : CssStyleService.rgbToHex(shade),
            "primary_shade_rgb" : `${shade[0]},${shade[1]},${shade[2]}`,
            "primary_normal": CssStyleService.rgbToHex(normal),
            "primary_tint": CssStyleService.rgbToHex(tint),
            "contrast_normal": CssStyleService.rgbToHex(contrast),
            "contrast_normal_rgb": `${contrast[0]},${contrast[1]},${contrast[2]}`,
            "contrast_shade": CssStyleService.rgbToHex(cShade)
        };
    }

    /**
     * converts the RGB-array [r, g, b] of a color to the HEX-string #******
     */
    private static rgbToHex(rgb: Array<number>): string {
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
    private static hexToRgb(hex: string): Array<number> {
        const rgb: Array<number> = [];

        for(let i: number = 1; i < hex.length; i += 2) {
            const hVal: string = `0x${hex[i]}${hex[i+1]}`;
            const val: number = parseInt(hVal, 16);
            rgb.push(val);
        }

        return rgb;
    }
}
