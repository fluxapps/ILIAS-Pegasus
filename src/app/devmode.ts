import {isDefined, isFunction} from "ionic-angular/es2015/util/util";

/**
 * Looks for a property {@code IonicDevServer} on the window.
 * If the property does exist and the {@code handleError} function is defined,
 * the ionic dev server is running.
 *
 * The common case, when this function returns true, is if the {@code ionic cordova emulate} command is used.
 *
 * @returns {boolean} true if the Ionic Dev Server is running, otherwise false
 */
export function isDevMode(): boolean {
  const monitor: IonicDevServer = <IonicDevServer>window["IonicDevServer"];

  return isDefined(monitor) && monitor.hasOwnProperty("handleError") && isFunction(monitor.handleError);
}

interface IonicDevServer {
  handleError(): void
}
