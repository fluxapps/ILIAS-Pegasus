import {Exception} from "./Exception";
/**
 */
export class OfflineException extends Exception {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, OfflineException.prototype);
    }
}
