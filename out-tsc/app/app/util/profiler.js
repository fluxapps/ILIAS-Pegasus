var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from "@angular/core";
/**
 * the Profiler-class can be used to track the performance and structure of parts of the code
 * @param enabled       if set to false, all calls to Profiler-methods will return immediately, without
 *                      logging. this reduces console-output and increases the performance
 * @param printInterval if enabled is set to true, then printInterval will call the print-methods of the
 *                      Profiler for all dt milliseconds
 */
var Profiler = /** @class */ (function () {
    function Profiler() {
    }
    Profiler_1 = Profiler;
    Profiler.instance = function () {
        if (Profiler_1.staticInstance == undefined)
            Profiler_1.staticInstance = new Profiler_1();
        return Profiler_1.staticInstance;
    };
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
    Profiler.addTimestamp = function (name, reset, list, id) {
        if (reset === void 0) { reset = false; }
        if (list === void 0) { list = "default"; }
        if (id === void 0) { id = "default"; }
        if (!Profiler_1.enabled)
            return;
        if (!Profiler_1.timeStamps.hasOwnProperty(list)) {
            Profiler_1.timeStamps["lists"].push(list);
            Profiler_1.timeStamps[list] = { ids: [id] };
            reset = true;
        }
        if (!Profiler_1.timeStamps[list].hasOwnProperty(id)) {
            Profiler_1.timeStamps[list].ids.push(id);
            Profiler_1.timeStamps[list][id] = [];
            reset = true;
            name = "id " + id;
        }
        Profiler_1.timeStamps[list][id].push({
            t: (new Date()).getTime(),
            name: name,
            reset: reset
        });
    };
    /**
     * Prints an ordered list of all registered timestamps
     * @param clear     if set to true, all timestamps will be cleared
     */
    Profiler.printTimestamps = function (clear) {
        if (clear === void 0) { clear = false; }
        if (!Profiler_1.enabled)
            return;
        if (!Profiler_1.timeStamps["lists"].length)
            return;
        for (var i = 0; i < Profiler_1.timeStamps["lists"].length; i++) {
            this.printList(Profiler_1.timeStamps["lists"][i], clear);
            console.log("~");
        }
    };
    /**
     * Prints an ordered list of all registered timestamps
     * @param list      if set to undefined, all lists will be cleared
     * @param id        if set to undefined, all id-entries in the given list will be cleared
     */
    Profiler.clearTimestamps = function (list, id) {
        if (list === void 0) { list = undefined; }
        if (id === void 0) { id = undefined; }
        if (!Profiler_1.enabled)
            return;
        (id && list) ? delete Profiler_1.timeStamps[list][id] :
            (list) ? delete Profiler_1.timeStamps[list] :
                Profiler_1.timeStamps = { lists: [] };
    };
    /**
     * adds an entry at the bottom of the call-list, without a timestamp
     * @param name      the name of the entry
     */
    Profiler.addCall = function (name) {
        if (!Profiler_1.enabled)
            return;
        Profiler_1.callList.push(name);
    };
    /**
     * prints the call-list that was filled with the addCall-method
     */
    Profiler.printCalls = function () {
        if (!Profiler_1.enabled)
            return;
        if (!Profiler_1.callList.length)
            return;
        console.log("CALL_LIST");
        for (var i = 0; i < Profiler_1.callList.length; i++)
            console.log(Profiler_1.callList[i]);
    };
    /**
     * clears the call-list
     */
    Profiler.clearCalls = function () {
        if (!Profiler_1.enabled)
            return;
        Profiler_1.callList = [];
    };
    /**
     * sets the time-interval for periodic prints of the timestamps and the call-list. for dt = 0,
     * the periodic prints get disabled. the prints only appear if Profiler.enabled is set to true
     * @param dt        the time-interval in milliseconds
     */
    Profiler.periodicPrints = function (dt) {
        if (!Profiler_1.enabled)
            return;
        if (dt)
            Profiler_1.printInterval = Profiler_1.getPrintInterval(dt);
        else
            clearInterval(Profiler_1.printInterval);
    };
    Profiler.getPrintInterval = function (dt) {
        return setInterval(function () {
            Profiler_1.printTimestamps();
            Profiler_1.printCalls();
        }, dt);
    };
    Profiler.printList = function (list, clear) {
        if (list === void 0) { list = "default"; }
        if (clear === void 0) { clear = false; }
        if (!Profiler_1.enabled)
            return;
        console.log("PROFILE_LIST " + list);
        console.log("time[s] tint[s] perc[%] name");
        for (var i = 0; i < Profiler_1.timeStamps[list].ids.length; i++) {
            this.printId(list, Profiler_1.timeStamps[list].ids[i], clear);
            console.log("~");
        }
    };
    Profiler.printId = function (list, id, clear) {
        if (list === void 0) { list = "default"; }
        if (id === void 0) { id = "default"; }
        if (clear === void 0) { clear = false; }
        if (!Profiler_1.enabled)
            return;
        function format(v) {
            var s = v.toFixed(3);
            return (v >= 10) ? ((v >= 100) ? s : "0" + s) : "00" + s;
        }
        if (!Profiler_1.timeStamps.hasOwnProperty(list)) {
            console.log("(@profiler) WARNING: did not find any entries");
            return;
        }
        if (!Profiler_1.timeStamps[list].hasOwnProperty(id)) {
            console.log("(@profiler) WARNING: did not find any entries");
            return;
        }
        var log = Profiler_1.timeStamps[list][id];
        var t0, dt;
        for (var i = 0; i < log.length; i++) {
            if (log[i].reset) {
                t0 = log[i].t;
                dt = undefined;
                for (var j = i + 1; j < log.length; j++) {
                    if (log[j].reset) {
                        dt = log[j - 1].t - log[i].t;
                        break;
                    }
                }
                dt = (dt) ? dt : log[log.length - 1].t - log[i].t;
            }
            var t = log[i].t - t0;
            var ti = (log[i].reset) ? 0 : log[i].t - log[i - 1].t;
            console.log(format(t / 1000) + " " + format(ti / 1000) + " " + format(100 * ti / dt) + " " + log[i].name);
        }
        if (clear)
            Profiler_1.clearTimestamps(list);
    };
    var Profiler_1;
    Profiler.staticInstance = undefined;
    Profiler.enabled = false;
    Profiler.printInterval = Profiler_1.getPrintInterval(5000);
    Profiler.timeStamps = { lists: [] };
    Profiler.callList = [];
    Profiler = Profiler_1 = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], Profiler);
    return Profiler;
}());
export { Profiler };
//# sourceMappingURL=profiler.js.map