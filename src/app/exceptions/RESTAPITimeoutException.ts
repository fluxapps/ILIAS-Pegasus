import {RESTAPIException} from "./RESTAPIException";

export class RESTAPITimeoutException extends RESTAPIException {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, RESTAPITimeoutException.prototype);
    }
}
