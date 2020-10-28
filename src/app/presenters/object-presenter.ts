/** services */
import { SafeUrl } from "@angular/platform-browser";
/** misc */
import { ILIASObject } from "../models/ilias-object";
import { ThemeProvider } from "../providers/theme/theme.provider";
import { FileService } from "../services/file.service";
import { ILIASAppUtils } from "../services/ilias-app-utils.service";
/** logging */
import { Logger } from "../services/logging/logging.api";
import { Logging } from "../services/logging/logging.service";

/**
 * Decorator to present data of ILIASObjects in the view.
 * Wraps an ILIASObject instance and returns presentation specific stuff
 */
export interface ILIASObjectPresenter {

    /**
     * Returns the ionic icon name for this object
     */
    readonly icon: Promise<string | SafeUrl>;

    /**
     * Returns the title
     */
    title(): string;

    /**
     * Should the type be displayed as text before the title?
     */
    showTypeAsText(): boolean;

    /**
     * Gets the language variable for the type;
     */
    typeLangVar(): string;

    /**
     * Return details from this object (used on the details page)
     */
    details(): Promise<Array<{label: string, value: string}>>

    /**
     * Return a list of badges to display for this object, color should be one of ionics colors, e.g. primary
     */
    metaBadges(): Promise<Array<{value: string, color: string}>>

    /**
     * Return a list of icons that are displayed for this object
     */
    metaIcons(): Promise<Array<{name: string, color: string}>>

}

/**
 * A generic presenter if the object type does not match a more specific one, e.g. CourseObjectPresenter
 */
export class GenericILIASObjectPresenter implements ILIASObjectPresenter {

    private readonly log: Logger = Logging.getLogger("GenericILIASObjectPresenter");
    private readonly _icon: Promise<string | SafeUrl>;

    constructor(
        protected iliasObject: ILIASObject,
        protected readonly themeProvider: ThemeProvider
    ) {
        this._icon = this.themeProvider.getIconSrc(this.iliasObject.type);
    }

    get icon(): Promise<string | SafeUrl> {
        return this._icon;
    }

    title(): string {
        return this.iliasObject.title;
    }

    typeLangVar(): string {
        return "object_type."+this.iliasObject.type;
    }

    showTypeAsText(): boolean {
        return true;
    }

    details(): Promise<Array<{label: string, value: string, translate?: boolean}>> {
        // let details = [{label: 'details.last_update', value: this.iliasObject.updatedAt ? this.iliasObject.updatedAt : this.iliasObject.createdAt}];
        const details = [];
        if (this.iliasObject.isContainer() && !this.iliasObject.isLinked()) {
            const detailPromises = [];

            // Container objects display the used disk space of file items below
            detailPromises.push(
                FileService.calculateDiskSpace(this.iliasObject)
                    .then(diskSpace => {
                        this.log.info(() => `Disk space used: ${ILIASAppUtils.formatSize(diskSpace)}`);
                        const detail = {label: "details.used_disk_space", value: ILIASAppUtils.formatSize(diskSpace)};
                        details.push(detail);
                        return Promise.resolve(detail);
                    })
            );

            detailPromises.push(
                Promise.resolve({label: "details.offline_available", value: this.iliasObject.isOfflineAvailable ? "yes" : "no", translate: true})
            );

            return Promise.all(detailPromises);
        } else {
            return Promise.resolve(details);
        }
    }

    async metaBadges(): Promise<Array<{value: string; color: string}>> {
        return [];
    }

    metaIcons(): Promise<Array<{name: string; color: string}>> {
        return new Promise((resolve, reject) => {
            const icons = [];
            if (this.iliasObject.isFavorite) {
                icons.push({name: "star", color: ""});
            }
            resolve(icons);
        });
    }
}
