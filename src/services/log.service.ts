import {Injectable} from '@angular/core';

@Injectable()
export class Log {

    public static debug:boolean = false;

    /**
     * Use this to do console text logs. This way we can more easily turn them on/off.
     * @param object
     * @param text
     */
    public static write(logger:any, text:string, ...param:any[]) {
        if(!Log.debug)
            return;
        if(!logger.constructor)
            return
        if(param.length > 0)
            console.log("[" + logger.constructor.name  + "] " + text, param[0]);
        else
            console.log("[" + logger.constructor.name  + "] " + text);
    }


    public static describe(logger:any, description:string, object:any) {
        if(!Log.debug)
            return;
        Log.write(logger, description, object);
    }

    public static error(logger:any, error:any) {
        if(!Log.debug)
            return;
        console.error("[" + logger.constructor.name  + "] ", error);

    }

}
