import {GenericILIASObjectPresenter} from "./object-presenter";
import {ILIASAppUtils} from "../services/ilias-app-utils.service";

export class FileObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "assets/icon/obj_file.svg";
    }

    title(): string {
        return super.title() + ` (${this.getFormattedSize()})`;
    }

    showTypeAsText(): boolean {
        return false;
    }

    details(): Promise<Array<{label: string; value: string}>> {
        return super.details().then(details => {
            const metaData = this.iliasObject.data;
            details.push({label: "details.availability", value: this.getLanguageVariableForLocalFile(), translate: true});
            details.push({label: "details.size", value: this.getFormattedSize()});
            details.push({label: "details.version", value: metaData.fileVersion});
            details.push({label: "details.remote_version_date", value: metaData.fileVersionDate});
            if (metaData.hasOwnProperty("fileVersionDateLocal") && metaData.fileVersionDateLocal) {
                details.push({label: "details.local_version_date", value: metaData.fileVersionDateLocal});
            }
            return Promise.resolve(details);
        });
    }

    protected getLanguageVariableForLocalFile(): string {
        if (this.fileReadyAndUpToDate()) {
            return "details.availabilities.up-to-date";
        } else if (this.fileReady()) {
            return "details.availabilities.needs_update";
        }
        return "details.availabilities.needs_download";
    }

    protected fileReady(): boolean {
        return (this.iliasObject.data.hasOwnProperty("fileVersionDateLocal") && this.iliasObject.data.fileVersionDateLocal);
    }

    protected fileReadyAndUpToDate(): boolean {
        return this.fileReady() && !this.iliasObject.needsDownload;
    }

    protected getFormattedSize() {
        return (this.iliasObject.data.hasOwnProperty("fileSize")) ? ILIASAppUtils.formatSize(this.iliasObject.data.fileSize) : "";
    }
}
