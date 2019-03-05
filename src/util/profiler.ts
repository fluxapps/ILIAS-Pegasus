import {Injectable} from "@angular/core";

interface LogEntry {
    t: number,
    name: string,
    reset: boolean
}

@Injectable()
export class Profiler {

    static enabled: boolean = true;
    private static staticInstance: Profiler = undefined;
    private static logs: object = {lists: []};

    static instance(): Profiler {
        if(Profiler.staticInstance == undefined)
            Profiler.staticInstance = new Profiler();
        return Profiler.staticInstance;
    }

    static add(name: string, reset: boolean = false, list: string = "default", id: string = "default"): void {
        if(!Profiler.enabled) return;

        if(!Profiler.logs.hasOwnProperty(list)) {
            Profiler.logs["lists"].push(list);
            Profiler.logs[list] = {ids: [id]};
            reset = true;
        }

        if(!Profiler.logs[list].hasOwnProperty(id)) {
            Profiler.logs[list].ids.push(id);
            Profiler.logs[list][id] = [];
            reset = true;
            name = `id ${id}`;
        }

        Profiler.logs[list][id].push({
            t: (new Date()).getTime(),
            name: name,
            reset: reset
        });
    }

    private static printId(list: string = "default", id: string = "default", clear: boolean = false): void {
        if(!Profiler.enabled) return;

        function format(v: number): string {
            const s: string = v.toFixed(3);
            return (v >= 10) ? ((v >= 100) ? s : "0" + s) : "00" + s;
        }

        if(!Profiler.logs.hasOwnProperty(list)) {
            console.log("(@profiler) WARNING: did not find any entries");
            return;
        }

        if(!Profiler.logs[list].hasOwnProperty(id)) {
            console.log("(@profiler) WARNING: did not find any entries");
            return;
        }

        const log: Array<LogEntry> = Profiler.logs[list][id];
        let t0: number, dt: number;
        for(let i: number = 0; i < log.length; i++) {

            if(log[i].reset) {
                t0 = log[i].t;
                dt = undefined;
                for(let j: number = i + 1; j < log.length; j++) {
                    if(log[j].reset) {
                        dt = log[j - 1].t - log[i].t;
                        break;
                    }
                }
                dt = (dt) ? dt : log[log.length - 1].t - log[i].t;
            }

            const t: number = log[i].t - t0;
            const ti: number = (log[i].reset) ? 0 : log[i].t - log[i - 1].t;
            console.log(`${format(t / 1000)} ${format(ti / 1000)} ${format(100 * ti / dt)} ${log[i].name}`);
        }

        if(clear) Profiler.clear(list);
    }

    static print(list: string = "default", clear: boolean = false): void {
        if(!Profiler.enabled) return;

        console.log(`PROFILE LIST '${list}'`);
        console.log("time[s] tint[s] perc[%] name");

        for(let i: number = 0; i < Profiler.logs[list].ids.length; i++) {
            this.printId(list, Profiler.logs[list].ids[i], clear);
            console.log("~");
        }
    }

    static clear(list: string = undefined, id: string = undefined): void {
        if(!Profiler.enabled) return;

        (id && list) ? delete Profiler.logs[list][id] :
            (list) ? delete Profiler.logs[list] :
                Profiler.logs = {lists: []};
    }
}
