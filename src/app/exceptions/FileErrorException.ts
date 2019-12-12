import {Exception} from "./Exception";

export class FileErrorException extends Exception {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, FileErrorException.prototype);
    }
}
