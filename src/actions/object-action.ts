export interface ILIASObjectActionAlert {
    title:string,
    subTitle:string
}


export abstract class ILIASObjectAction {

    title:string;

    public id:number;

    public static idCounter:number = 9999999;

    /**
     * Resolves a promise if the action is completed, rejects if the action failed
     */
    abstract execute():Promise<ILIASObjectActionResult>;

    /**
     * Returns a object if this action needs an alert before it is executed
     */
    abstract alert():ILIASObjectActionAlert;

    public instanceId():number {
        if(this.id == null) {
            this.id = ILIASObjectAction.idCounter;
            ILIASObjectAction.idCounter++;
        }
        return this.id;
    }

}

export abstract class ILIASObjectActionResult {
    public constructor(public message:string ) {
    }
}

/**
 * An instance of this class can be returned when an action resolves its promise.
 */
export class ILIASObjectActionSuccess extends ILIASObjectActionResult {
}

/**
 * An instance of this class can be returned when an action rejects its promise.
 */
export class ILIASObjectActionError extends ILIASObjectActionResult{
}

export class ILIASObjectActionNoMessage extends ILIASObjectActionResult {
    public constructor() {
        super("");
    }
}