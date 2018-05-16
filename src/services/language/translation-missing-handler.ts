import {MissingTranslationHandler, MissingTranslationHandlerParams, TranslateService} from "ng2-translate";
import {Injectable} from "@angular/core";
import {Logger} from "../logging/logging.api";
import {Logging} from "../logging/logging.service";

/**
 * Fallback handler for translation.
 * The handler will check if the missing translation is due to a unknown type which may happens with ILIAS plugins.
 * If the key do not start with the "object_type" namespace the missing key is return as translation in order to
 * indicate which variable is missing.
 *
 * It is not possible to translate a string within this handler due to the fact that the
 * TranslationService is depending on the MissingTranslation handler.
 *
 * @author Nicolas Schaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 * @since v2.0.1
 */
@Injectable()
export class PegasusMissingTranslationHandler extends MissingTranslationHandler {

    private static readonly OBJECT_TYPE_KEY: string = "object_type.";
    private readonly log: Logger = Logging.getLogger(PegasusMissingTranslationHandler.name);

    handle(params: MissingTranslationHandlerParams): string {

        // check if we got a object_type which indicates that we got a unknown object from ILIAS most likely a plugin
        if(params.key.startsWith(PegasusMissingTranslationHandler.OBJECT_TYPE_KEY) === true) {
            this.log.warn(() => `No ILIAS object translation found for "${params.key}" fallback to "Object" translation.`);
            return "Object";
        }

        this.log.warn(() => `Missing translation falling back to key "${params.key}"`);
        return params.key;
    }
}
