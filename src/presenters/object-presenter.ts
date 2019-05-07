import {ILIASObject} from "../models/ilias-object";
import {ILIASAppUtils} from "../services/ilias-app-utils.service";
import {FileService} from "../services/file.service";
import {Log} from "../services/log.service";

/**
 * Decorator to present data of ILIASObjects in the view.
 * Wraps an ILIASObject instance and returns presentation specific stuff
 */
export interface ILIASObjectPresenter {

    /**
     * Returns the ionic icon name for this object
     */
    icon(): string;

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

    constructor(
        protected iliasObject: ILIASObject
    ) {}

    icon(): string {
        return "assets/icon/obj_link.svg";
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
                        Log.describe(this, "Disk space used: ", ILIASAppUtils.formatSize(diskSpace));
                        const detail = {label: "details.used_disk_space", value: ILIASAppUtils.formatSize(diskSpace)};
                        details.push(detail);
                        return Promise.resolve(detail);
                    })
            );

            // And the potentially used diskspace
            detailPromises.push(
                FileService.calculateDiskSpace(this.iliasObject, false)
                    .then(diskSpace => {
                        Log.describe(this, "Potentially used disk space: ", ILIASAppUtils.formatSize(diskSpace));
                        const detail = {label: "details.potentially_used_disk_space", value: ILIASAppUtils.formatSize(diskSpace)};
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

    metaBadges(): Promise<Array<{value: string; color: string}>> {
        return new Promise((resolve, reject) => {
            const badges = [];
            if (this.iliasObject.isNew) {
                badges.push({value: "New", color: "primary"});
            }
            if (this.iliasObject.isUpdated) {
                badges.push({value: "Updated", color: "primary"});
            }
            // Container display the number of new objects of their children
            if (this.iliasObject.isContainer()) {
                ILIASObject.findByParentRefIdRecursive(this.iliasObject.refId, this.iliasObject.userId).then(iliasObjects => {
                    const newObjects = iliasObjects.filter(iliasObject => {
                        return iliasObject.isNew;
                    });
                    const n = newObjects.length;
                    if (n) {
                        badges.push({value: n, color: "primary"});
                    }
                    resolve(badges);
                });
            } else {
                resolve(badges);
            }
        });
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
