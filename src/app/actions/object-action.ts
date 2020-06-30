export interface ILIASObjectActionAlert {
    title: string,
    subTitle: string
}


export abstract class ILIASObjectAction {

    static idCounter: number = 9999999;

    title: string;

    id: number;

    /**
     * Resolves a promise if the action is completed, rejects if the action failed
     */
    abstract execute(): Promise<ILIASObjectActionResult>;

    /**
     * Returns a object if this action needs an alert before it is executed
     */
    abstract alert(): ILIASObjectActionAlert|undefined;

    instanceId(): number {
        if(this.id === null) {
            this.id = ILIASObjectAction.idCounter;
            ILIASObjectAction.idCounter++;
        }
        return this.id;
    }

}

export abstract class ILIASObjectActionResult {
    constructor(public message: string ) {
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
    constructor() {
        super("");
    }
}
