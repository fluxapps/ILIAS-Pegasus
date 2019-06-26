import {isDefined, isFunction} from "ionic-angular/es2015/util/util";
//import {isDevMode as isAngularDevMode} from "@angular/core";

/**
 * Returns true if the dev mode is enabled, otherwise returns false.
 *
 * The app is considered to run in dev mode if one of the following conditions are met:
 * - If the ionic dev server is running
 * - If the angular dev mode is enabled.
 *
 * @returns {boolean} true if the pegasus dev mode is enabled, otherwise false.
 */
export function isDevMode(): boolean {
  const monitor: IonicDevServer = <IonicDevServer>window["IonicDevServer"];

  return    isDefined(monitor) &&
            isFunction(monitor.handleError); 
            // ||
            // isAngularDevMode();
}

interface IonicDevServer {
  handleError(): void
}
