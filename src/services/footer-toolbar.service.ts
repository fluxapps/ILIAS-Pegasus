import {Injectable} from "@angular/core";
import {DownloadProgress} from "./file.service";
import {Log} from "./log.service";
import {Logger} from "./logging/logging.api";
import {Logging} from "./logging/logging.service";

@Injectable()
export class FooterToolbarService {

    private log: Logger = Logging.getLogger(FooterToolbarService.name);

    offline: boolean = false;

    private _isLoading: boolean = false;
    private _loadingText: string = "";
    private jobs: Array<{id: number, text: string}> = [];

    constructor() {}

    get isLoading(): boolean {
        return this._isLoading;
    }

    addJob(id: number, text: string): void {
        this.spliceId(id);
        this.jobs.push({id: id, text: text});
        this.updateLoading();
    }

    removeJob(id: number): void {
        this.spliceId(id);
        this.updateLoading();
    }

    /**
     * this method removes all occurences of the job with id.
     * @param id
     */
    private spliceId(id: number): void {
        for (const key in this.jobs) {
            if (this.jobs[key].id == id) {
                this.jobs.splice((<any> key), 1);
            }
        }
    };

    private updateLoading(): void {
        const jobs: number = this.countJobs();
        this.log.debug(() => `number of jobs running: ${jobs}`);
        this.log.debug(() => `Currently running jobs: ${this.jobs}`);
        if (jobs > 0) {
            this._isLoading = true;
            this._loadingText = this.getCurrentText();
        } else {
            this._isLoading = false;
            this._loadingText = "";
        }
    }

    private getCurrentText(): string {
        // with the slice we make sure the last element is not popped from the original array.
        if (this.jobs.slice(-1).pop()) {
            const job: {id: number, text: string} = this.jobs.slice(-1).pop();
            return job.text;
        }
        else
            return "";
    }

    private countJobs(): number {
        return this.jobs.length;
    }

    get loadingText(): string {
        return this._loadingText;
    }
}

// Positive Ids are reserved for Jobs that have an ID related to the ILIAS object id.
export enum Job {
    DeleteFilesTree = -1,
    MarkFiles = -2,
    FileDownload = -3,
    Synchronize = -4,
    DeleteFilesSettings = -5,
    DesktopAction = -6,
    LoadFavorites = -7,
    LoadNewObjects = -8,
    MetaDataFetch = -1,
}
