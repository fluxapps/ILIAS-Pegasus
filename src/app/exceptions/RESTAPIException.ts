import {Exception} from "./Exception";

export class RESTAPIException extends Exception {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, RESTAPIException.prototype);
    }
}
