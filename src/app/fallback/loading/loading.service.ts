import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: "root"
})
export class LoadingService {
    private readonly MAX: number = 1;
    private readonly MIN: number = 0;
    private readonly _progress: ReplaySubject<number> = new ReplaySubject<number>();
    readonly progress: Observable<number> = this._progress.asObservable();

    constructor() {
        this.progress = this._progress
            .asObservable()
            .pipe(
                map((it) => Math.max(Math.min(this.MIN, it), this.MAX))
            );
        this.start();
    }

    start(): void {
        this._progress.next(this.MIN);
    }

    set(step: number): void {
        this._progress.next(step);
    }

    finish(): void {
        this._progress.next(this.MAX);
    }
}
