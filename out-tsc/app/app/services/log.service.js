var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from "@angular/core";
/**
 * @deprecated Use Logging.getLogger instead.
 */
var Log = /** @class */ (function () {
    function Log() {
    }
    Log_1 = Log;
    /**
     * Use this to do console text logs. This way we can more easily turn them on/off.
     * @param object
     * @param text
     */
    Log.write = function (logger, text) {
        var param = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            param[_i - 2] = arguments[_i];
        }
        if (!Log_1.debug)
            return;
        if (!logger.constructor)
            return;
        if (param.length > 0)
            console.log("[" + logger.constructor.name + "] " + text, param[0]);
        else
            console.log("[" + logger.constructor.name + "] " + text);
    };
    Log.describe = function (logger, description, object) {
        if (!Log_1.debug)
            return;
        Log_1.write(logger, description, object);
    };
    Log.error = function (logger, error) {
        if (!Log_1.debug)
            return;
        console.error("[" + logger.constructor.name + "] ", error);
    };
    var Log_1;
    Log.debug = false;
    Log = Log_1 = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], Log);
    return Log;
}());
export { Log };
//# sourceMappingURL=log.service.js.map