import {isDefined, isFunction} from "ionic-angular/es2015/util/util";

export function isDevMode(): boolean {
  const monitor: IonicDevServer = <IonicDevServer>window["IonicDevServer"];

  return isDefined(monitor) && monitor.hasOwnProperty("handleError") && isFunction(monitor.handleError);
}

interface IonicDevServer {
  handleError(): void
}
