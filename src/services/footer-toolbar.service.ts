import {Injectable} from '@angular/core';
import {DownloadProgress} from "./file.service";
import {Log} from "./log.service";

@Injectable()
export class FooterToolbarService {

    private _offline: boolean = false;

    public constructor() {
    }

    protected _isLoading: boolean = false;
    protected _loadingText: string = '';
    protected _buttons: Array<{label: string, icon: string, handler: any}> = [];
    protected _jobs: {id: number, text: string}[] = [];
    protected _jobsProgress: {[id: number]: DownloadProgress} = {};

    public get isLoading() {
        return this._isLoading;
    }

    public addJob(id: number, text: string) {
        this.spliceId(id);
        this._jobs.push({id: id, text: text});
        this.updateLoading();
    }

    public removeJob(id: number) {
        this.spliceId(id);
        this.updateLoading();
    }

    /**
     * this method removes all occurences of the job with id.
     * @param id
     */
    private spliceId(id: number) {
        for (let key in this._jobs) {
            if (this._jobs[key].id == id) {
                this._jobs.splice((<any> key), 1);
            }
        }
    };

    protected updateLoading() {
        const jobs = this.countJobs();
        Log.write(this, "number of jobs running: ", this.countJobs());
        Log.write(this, "Currently running jobs: ", this._jobs);
        if (jobs > 0) {
            this._isLoading = true;
            this._loadingText = this.getCurrentText();
        } else {
            this._isLoading = false;
            this._loadingText = '';
        }
    }

    protected getCurrentText(): string {
        // with the slice we make sure the last element is not popped from the original array.
        if (this._jobs.slice(-1).pop()) {
            let job: {id: number, text: string} = this._jobs.slice(-1).pop();
            return job.text;
        }
        else
            return "";
    }

    protected countJobs(): number {
        return this._jobs.length;
    }

    public get loadingText() {
        return this._loadingText;
    }

    get offline(): boolean {
        return this._offline;
    }

    set offline(value: boolean) {
        this._offline = value;
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
