import {Exception} from "./Exception";
/**
 * There is no running sync.
 */
export class NoSyncOpenException extends Exception {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NoSyncOpenException.prototype);
    }
}
