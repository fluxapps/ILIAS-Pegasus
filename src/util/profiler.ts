import {Injectable} from "@angular/core";

interface LogEntry {
    t: number,
    name: string,
    reset: boolean
}

/**
 * the Profiler-class can be used to track the performance and structure of parts of the code
 * @param enabled       if set to false, all calls to Profiler-methods will return immediately, without
 *                      logging. this reduces console-output and increases the performance
 * @param printInterval if enabled is set to true, then printInterval will call the print-methods of the
 *                      Profiler for all dt milliseconds
 */

@Injectable()
export class Profiler {

    private static staticInstance: Profiler = undefined;
    static enabled: boolean = false;
    private static printInterval: NodeJS.Timer = Profiler.getPrintInterval(5000);
    private static timeStamps: object = {lists: []};
    private static callList: Array<string> = [];

    static instance(): Profiler {
        if(Profiler.staticInstance == undefined)
            Profiler.staticInstance = new Profiler();
        return Profiler.staticInstance;
    }

    /**
     * addTimestamp a timestamp with name 'name' to th list 'list'
     * @param name      name of the timestamp
     * @param reset     if true, a timestamp with t=0 is added as a new reference for following timestamps
     * @param list      list in which the timestamp wil be added
     * @param id        if the same sequence of addTimestamp-calls is repeated for different objects, then the id
     *                  can be used to indicate the specific object
     *
     * example:
     *
     * Profiler.addTimestamp("start_for", true, "example");
     * for (i = 0; i < n; i++) {
     *     Profiler.addTimestamp("start", true, "in_for_loop", toString(i));
     *     // code part1
     *     Profiler.addTimestamp("part1", false, "in_for_loop", toString(i));
     *     // code part2
     *     Profiler.addTimestamp("part2", false, "in_for_loop", toString(i));
     * }
     * Profiler.addTimestamp("end_for", false, "example");
     */
    static addTimestamp(name: string, reset: boolean = false, list: string = "default", id: string = "default"): void {
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

    /**
     * Prints an ordered list of all registered timestamps
     * @param clear     if set to true, all timestamps will be cleared
     */
    static printTimestamps(clear: boolean = false): void {
        if(!Profiler.enabled) return;
        if(!Profiler.timeStamps["lists"].length) return;

        for(let i: number = 0; i < Profiler.timeStamps["lists"].length; i++) {
            this.printList(Profiler.timeStamps["lists"][i], clear);
            console.log("~");
        }
    }

    /**
     * Prints an ordered list of all registered timestamps
     * @param list      if set to undefined, all lists will be cleared
     * @param id        if set to undefined, all id-entries in the given list will be cleared
     */
    static clearTimestamps(list: string = undefined, id: string = undefined): void {
        if(!Profiler.enabled) return;

        (id && list) ? delete Profiler.timeStamps[list][id] :
            (list) ? delete Profiler.timeStamps[list] :
                Profiler.timeStamps = {lists: []};
    }

    /**
     * adds an entry at the bottom of the call-list, without a timestamp
     * @param name      the name of the entry
     */
    static addCall(name: string): void {
        if(!Profiler.enabled) return;

        Profiler.callList.push(name);
    }

    /**
     * prints the call-list that was filled with the addCall-method
     */
    static printCalls(): void {
        if(!Profiler.enabled) return;
        if(!Profiler.callList.length) return;

        console.log("CALL_LIST");
        for (let i: number = 0; i < Profiler.callList.length; i++)
            console.log(Profiler.callList[i]);
    }

    /**
     * clears the call-list
     */
    static clearCalls(): void {
        if(!Profiler.enabled) return;

        Profiler.callList = [];
    }

    /**
     * sets the time-interval for periodic prints of the timestamps and the call-list. for dt = 0,
     * the periodic prints get disabled. the prints only appear if Profiler.enabled is set to true
     * @param dt        the time-interval in milliseconds
     */
    static periodicPrints(dt: number): void {
        if(!Profiler.enabled) return;

        if(dt) Profiler.printInterval = Profiler.getPrintInterval(dt);
        else clearInterval(Profiler.printInterval);
    }

    static getPrintInterval(dt: number): NodeJS.Timer {
        return setInterval(() => {
            Profiler.printTimestamps();
            Profiler.printCalls()
        }, dt);
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

        if(clear) Profiler.clearTimestamps(list);
    }

}
