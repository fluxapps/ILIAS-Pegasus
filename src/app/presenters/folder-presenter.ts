import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class FolderObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.getIconSrc("fold");
    }

    showTypeAsText(): boolean {
        return false;
    }

    details(): Promise<Array<{label: string, value: string, translate?: boolean}>> {
        // let details = [{label: 'details.last_update', value: this.iliasObject.updatedAt ? this.iliasObject.updatedAt : this.iliasObject.createdAt}];
        const details = [];
        if (this.iliasObject.isContainer() && !this.iliasObject.isLinked()) {
            const detailPromises = [];

            detailPromises.push(
                Promise.resolve({label: "details.offline_available", value: this.iliasObject.isOfflineAvailable ? "yes" : "no", translate: true})
            );

            return Promise.all(detailPromises);
        } else {
            return Promise.resolve(details);
        }
    }

}
