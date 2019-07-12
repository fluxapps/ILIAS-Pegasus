var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";
// TODO migration Alert, AlertOptions, IonicErrorHandler from ionic-angular
import { isNullOrUndefined, isNumber, isObject, isString } from "util";
import { isDevMode } from "./devmode";
import { TranslateService } from "@ngx-translate/core";
import { Logging } from "./services/logging/logging.service";
// TODO migration import {AlertButton} from "@ionic/angular/components/alert/alert-options";
// errors and exceptions
import { Error } from "tslint/lib/error";
import { TimeoutError } from "rxjs/Rx";
// TODO migration import {HardwareAccessError} from "./services/device/hardware-features/hardware-access.errors";
import { FileErrorException } from "./exceptions/FileErrorException";
import { CantOpenFileTypeException } from "./exceptions/CantOpenFileTypeException";
import { NoWLANException } from "./exceptions/noWLANException";
import { OfflineException } from "./exceptions/OfflineException";
import { RESTAPIException } from "./exceptions/RESTAPIException";
/**
 * Error handler of ILIAS Pegasus
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
var PegasusErrorHandler = /** @class */ (function () {
    function PegasusErrorHandler(// TODO migration private readonly ionicErrorHandler: IonicErrorHandler,
    alert, translate) {
        this.alert = alert;
        this.translate = translate;
        this.displayedAlerts = [];
        this.log = Logging.getLogger(PegasusErrorHandler_1.name);
    }
    PegasusErrorHandler_1 = PegasusErrorHandler;
    /**
     * Handles the given {@code error}.
     *
     * If the error is an instance of {@link HardwareAccessError}, it will be ignored.
     * Such an error is already handled and part of the fallback screen functionality.
     *
     * If the app runs in the ionic dev server, the error will be delegated to the
     * {@link IonicErrorHandler} in order to display a stacktrace.
     *
     * @param error - the thrown error
     */
    PegasusErrorHandler.prototype.handleError = function (error) {
        try {
            var unwrappedError = this.getErrorInstance(error);
            // Ignore HardwareAccessError
            /* TODO migration if (unwrappedError instanceof HardwareAccessError) {
                this.log.debug(() => `Hardware access error received with message: ${unwrappedError.message}`);
                return;
            }*/
            if (unwrappedError instanceof NoWLANException) {
                //TODO log this.log.warn(() => "Unable to sync newsPresenters no wlan active.");
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("sync.stopped_no_wlan"));
                return;
            }
            /*
                        if (unwrappedError instanceof UnfinishedHttpRequestError) {
                            //TODO log this.log.warn(() => `Unable to sync due to http request error with message "${unwrappedError.message}".`);
                            this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                            return;
                        }
            */
            if (unwrappedError instanceof RESTAPIException) {
                //TODO log this.log.warn(() => "Unable to sync server not reachable.");
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                return;
            }
            if (unwrappedError instanceof TimeoutError) {
                //TODO log this.log.warn(() => "Unable to sync due to request timeout.");
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                return;
            }
            /*
                        if(unwrappedError instanceof HttpRequestError) {
                            //TODO log this.log.warn(() => `Unable to sync due to http request error "${unwrappedError.statuscode}".`);
                            this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                            return;
                        }
            
                        if(unwrappedError instanceof JsonValidationError) {
                            //TODO log this.log.warn(() => `Unable to parse server response invalid json, error message "${unwrappedError.message}".`);
                            this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_response_validation_error"));
                            return;
                        }
            */
            if (unwrappedError instanceof OfflineException) {
                //TODO log this.log.warn(() => `OfflineException occurred with message: "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("actions.offline_and_no_local_file"));
                return;
            }
            if (unwrappedError instanceof CantOpenFileTypeException) {
                //TODO log this.log.warn(() => `Unable to open file with message: "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("actions.cant_open_file"));
                return;
            }
            if (unwrappedError instanceof FileErrorException) {
                //TODO log this.log.warn(() => `Unable to handle file with message: "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("actions.file_error"));
                return;
            }
            //TODO log this.log.error(() => `Unhandled error occurred of type: ${unwrappedError}`);
            //TODO log this.log.error(() => `JSON of error: ${JSON.stringify(unwrappedError)}`);
            if (isDevMode()) {
                // TODO migration this.ionicErrorHandler.handleError(error);
            }
            else {
                this.displayAlert(PegasusErrorHandler_1.ERROR_TITLE, this.translate.instant("something_went_wrong"));
            }
        }
        catch (err) {
            //TODO log this.log.warn(
            //TODO log     () => `Error occurred during error handling: ${this.stringifyWithoutCyclicObjects(err)}, previous error ${this.stringifyWithoutCyclicObjects(error)}`
            //TODO log );
            //TODO log this.log.error(() => `Error unhandled of type: ${err}`);
            //TODO log this.log.error(() => `JSON of error: ${JSON.stringify(err)}`);
            //TODO log this.log.error(() => `Previous error unhandled of type: ${error}`);
            //TODO log this.log.error(() => `JSON of previous error: ${JSON.stringify(error)}`);
        }
    };
    PegasusErrorHandler.prototype.getErrorInstance = function (errorLike) {
        if (isNullOrUndefined(errorLike))
            return new Error("Unhandled exception is null or undefined.");
        if (isString(errorLike))
            return new Error("String value thrown: \"" + errorLike + "\"");
        if (isNumber(errorLike))
            return new Error("Number value thrown: \"" + errorLike + "\"");
        //check if we got a zone js error
        if (errorLike.hasOwnProperty("rejection")) {
            var zoneJsEvent = errorLike;
            //unwrap error
            return zoneJsEvent.rejection;
        }
        if (errorLike instanceof Error)
            return errorLike;
        if (isObject(errorLike))
            return new Error(this.stringifyWithoutCyclicObjects(errorLike));
        return new Error("Unknown error value thrown: \"" + errorLike + "\"");
    };
    PegasusErrorHandler.prototype.displayAlert = function (title, message) {
        /* TODO migration
        const alertEntry: AlertEntry = this.displayedAlerts.filter(e => e.title === title && e.message === message)[0];
        if(alertEntry === undefined) {
            const alert: Alert = this.alert.create(<AlertOptions>{
                title: title,
                message: message,
                buttons: [
                    <AlertButton>{
                        text: "Ok",
                        handler: (_: boolean): void => {
                            this.log.debug(() => `Alert with title "${title}" dismissed.`);
                        }
                    }
                ]
            });
            this.displayedAlerts.push({alert: alert, title: title, message: message, cnt: 1});
            alert.onDidDismiss(() =>
                this.displayedAlerts = this.displayedAlerts.filter(e => e.title !== title && e.message !== message)
            );
            alert.present().then(() => this.log.debug(() => `Alert with title "${title}" presented.`));
        } else {
            alertEntry.cnt++;
            alertEntry.alert.setTitle(`${alertEntry.title} (${alertEntry.cnt})`);
        }*/
    };
    PegasusErrorHandler.prototype.stringifyWithoutCyclicObjects = function (errorLike) {
        var seen = [];
        //https://stackoverflow.com/questions/9382167/serializing-object-that-contains-cyclic-object-value
        var stringObject = JSON.stringify(errorLike, function (key, val) {
            if (val !== null && val !== undefined && val instanceof Object) {
                if (seen.indexOf(val) >= 0) {
                    return {};
                }
                seen.push(val);
            }
            if (!val.hasOwnProperty("toISOString"))
                return {};
            return val;
        });
        return stringObject;
    };
    var PegasusErrorHandler_1;
    PegasusErrorHandler.ERROR_TITLE = "Pegasus";
    PegasusErrorHandler = PegasusErrorHandler_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [AlertController,
            TranslateService])
    ], PegasusErrorHandler);
    return PegasusErrorHandler;
}());
export { PegasusErrorHandler };
//# sourceMappingURL=error-handler.js.map