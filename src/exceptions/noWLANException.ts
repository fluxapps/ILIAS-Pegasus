import {Exception} from "./Exception";
/**
 * This error is thrown by the sync when you lose WLAN connection and you specified in the options that you only want
 * to download with WLAN.
 */
export class NoWLANException extends Exception {
}