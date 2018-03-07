import {Injectable} from "@angular/core";

/**
 * @deprecated Use Logging.getLogger instead.
 */
@Injectable()
export class Log {

    static debug: boolean = false;

    /**
     * Use this to do console text logs. This way we can more easily turn them on/off.
     * @param object
     * @param text
     */
    static write(logger: any, text: string, ...param: Array<any>) {
        if(!Log.debug)
            return;
        if(!logger.constructor)
            return;
        if(param.length > 0)
            console.log("[" + logger.constructor.name  + "] " + text, param[0]);
        else
            console.log("[" + logger.constructor.name  + "] " + text);
    }


    static describe(logger: any, description: string, object: any) {
        if(!Log.debug)
            return;
        Log.write(logger, description, object);
    }

    static error(logger: any, error: any) {
        if(!Log.debug)
            return;
        console.error("[" + logger.constructor.name  + "] ", error);

    }

}
