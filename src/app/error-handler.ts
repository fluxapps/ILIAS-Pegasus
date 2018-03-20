import {ErrorHandler, Injectable} from "@angular/core";
import {Alert, AlertController, AlertOptions, IonicErrorHandler} from "ionic-angular";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {TranslateService} from "ng2-translate/src/translate.service";
import {TimeoutError} from "rxjs/Rx";
import {Error} from "tslint/lib/error";
import {isNullOrUndefined, isNumber, isObject, isString} from "util";
import {CantOpenFileTypeException} from "../exceptions/CantOpenFileTypeException";
import {NoWLANException} from "../exceptions/noWLANException";
import {OfflineException} from "../exceptions/OfflineException";
import {RESTAPIException} from "../exceptions/RESTAPIException";
import {HttpRequestError, JsonValidationError, UnfinishedHttpRequestError} from "../providers/http";
import {HardwareAccessError} from "../services/device/hardware-features/hardware-access.errors";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
import {isDevMode} from "./devmode";

/**
 * Error handler of ILIAS Pegasus
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
@Injectable()
export class PegasusErrorHandler implements ErrorHandler {

    private static readonly ERROR_TITLE: string = "Pegasus";

    private readonly log: Logger = Logging.getLogger(PegasusErrorHandler.name);

    constructor(private readonly ionicErrorHandler: IonicErrorHandler,
                private readonly alert: AlertController,
                private readonly translate: TranslateService,) {
    }

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
    handleError(error: undefined|null|string|number|object): void {

        try {

            const unwrappedError: Error = this.getErrorInstance(error);

            // Ignore HardwareAccessError
            if (unwrappedError instanceof HardwareAccessError) {
                this.log.debug(() => `Hardware access error received with message: ${unwrappedError.message}`);
                return;
            }

            if (unwrappedError instanceof NoWLANException) {
                this.log.warn(() => "Unable to sync newsPresenters no wlan active.");
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("sync.stopped_no_wlan"));
                return;
            }

            if (unwrappedError instanceof UnfinishedHttpRequestError) {
                this.log.warn(() => `Unable to sync due to http request error with message "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                return;
            }

            if (unwrappedError instanceof RESTAPIException) {
                this.log.warn(() => "Unable to sync server not reachable.");
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                return;
            }

            if(unwrappedError instanceof TimeoutError) {
                this.log.warn(() => "Unable to sync due to request timeout.");
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                return;
            }

            if(unwrappedError instanceof HttpRequestError) {
                this.log.warn(() => `Unable to sync due to http request error "${unwrappedError.statuscode}".`);
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_not_reachable"));
                return;
            }

            if(unwrappedError instanceof JsonValidationError) {
                this.log.warn(() => `Unable to parse server response invalid json, error message "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.server_response_validation_error"));
                return;
            }

            if (unwrappedError instanceof OfflineException) {
                this.log.warn(() => `OfflineException occurred with message: "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.offline_and_no_local_file"));
                return;
            }

            if (unwrappedError instanceof CantOpenFileTypeException) {
                this.log.warn(() => `Unable to open file with message: "${unwrappedError.message}".`);
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("actions.cant_open_file"));
                return;
            }

            this.log.error(() => `Unhandled error occurred of type: ${unwrappedError}`);

            if (isDevMode()) {
                this.ionicErrorHandler.handleError(error);
            } else {
                this.displayAlert(PegasusErrorHandler.ERROR_TITLE, this.translate.instant("something_went_wrong"));
            }

        } catch (err) {
            this.log.warn(() => `Error occurred during error handling: ${JSON.stringify(err)}, previous error ${JSON.stringify(error)}`);
        }
    }

    private getErrorInstance(errorLike: undefined|null|string|number|object): Error {

        if(isNullOrUndefined(errorLike))
            return new Error("Unhandled exception is null or undefined.");

        if(isString(errorLike))
            return new Error(`String value thrown: "${errorLike}"`);

        if(isNumber(errorLike))
            return new Error(`Number value thrown: "${errorLike}"`);

        //check if we got a zone js error
        if (errorLike.hasOwnProperty("rejection")) {

            const zoneJsEvent: ZoneJsUncaughtPromiseEvent = errorLike as ZoneJsUncaughtPromiseEvent;

            //unwrap error
            return zoneJsEvent.rejection;
        }

        if(errorLike instanceof Error)
            return errorLike;

        if(isObject(errorLike))
            return new Error(JSON.stringify(errorLike));

        return new Error(`Unknown error value thrown: "${errorLike}"`);
    }

    private displayAlert(title: string, message: string): void {
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
        alert.present().then(() => this.log.debug(() => `Alert with title "${title}" presented.`));
    }
}

interface ZoneJsUncaughtPromiseEvent {
    rejection: Error
}
