import {Exception} from "./Exception";

export class CantOpenFileTypeException extends Exception {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CantOpenFileTypeException.prototype);
    }
}
