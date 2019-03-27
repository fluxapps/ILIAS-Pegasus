import {Injectable} from "@angular/core";

interface LogEntry {
    t: number,
    name: string,
    reset: boolean
}

@Injectable()
export class Profiler {

    private static staticInstance: Profiler = undefined;
    static enabled: boolean = false;
    private static printInterval: NodeJS.Timer = setInterval(function() {
        if(!Profiler.enabled) {
            clearInterval(Profiler.printInterval)
        } else {
            Profiler.print();
            Profiler.printCalls();
        }
    }, 10000);
    private static timeStamps: object = {lists: []};
    private static callList: Array<string> = [];

    static instance(): Profiler {
        if(Profiler.staticInstance == undefined)
            Profiler.staticInstance = new Profiler();
        return Profiler.staticInstance;
    }

    static add(name: string, reset: boolean = false, list: string = "default", id: string = "default"): void {
        if(!Profiler.enabled) return;

        if(!Profiler.timeStamps.hasOwnProperty(list)) {
            Profiler.timeStamps["lists"].push(list);
            Profiler.timeStamps[list] = {ids: [id]};
            reset = true;
        }

        if(!Profiler.timeStamps[list].hasOwnProperty(id)) {
            Profiler.timeStamps[list].ids.push(id);
            Profiler.timeStamps[list][id] = [];
            reset = true;
            name = `id ${id}`;
        }

        Profiler.timeStamps[list][id].push({
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

        if(!Profiler.timeStamps.hasOwnProperty(list)) {
            console.log("(@profiler) WARNING: did not find any entries");
            return;
        }

        if(!Profiler.timeStamps[list].hasOwnProperty(id)) {
            console.log("(@profiler) WARNING: did not find any entries");
            return;
        }

        const log: Array<LogEntry> = Profiler.timeStamps[list][id];
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

    static printList(list: string = "default", clear: boolean = false): void {
        if(!Profiler.enabled) return;

        console.log(`PROFILE_LIST ${list}`);
        console.log("time[s] tint[s] perc[%] name");

        for(let i: number = 0; i < Profiler.timeStamps[list].ids.length; i++) {
            this.printId(list, Profiler.timeStamps[list].ids[i], clear);
            console.log("~");
        }
    }

    static print(clear: boolean = false): void {
        if(!Profiler.enabled) return;

        for(let i: number = 0; i < Profiler.timeStamps["lists"].length; i++) {
            this.printList(Profiler.timeStamps["lists"][i], clear);
            console.log("~");
        }
    }

    static periodicPrints(dt: number): void {
        if(!Profiler.enabled) return;

        if(dt) Profiler.printInterval = setInterval(function() {
            Profiler.print();
            Profiler.printCalls()
        }, dt);
        else clearInterval(Profiler.printInterval);
    }

    static clear(list: string = undefined, id: string = undefined): void {
        if(!Profiler.enabled) return;

        (id && list) ? delete Profiler.timeStamps[list][id] :
            (list) ? delete Profiler.timeStamps[list] :
                Profiler.timeStamps = {lists: []};
    }

    static addCall(name: string): void {
        if(!Profiler.enabled) return;

        Profiler.callList.push(name);
    }

    static printCalls(): void {
        if(!Profiler.enabled) return;

        console.log("CALL_LIST");
        for (let i: number = 0; i < Profiler.callList.length; i++)
            console.log(Profiler.callList[i]);
    }

    static clearCalls(): void {
        if(!Profiler.enabled) return;

        Profiler.callList = [];
    }

}
