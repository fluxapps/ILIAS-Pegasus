import {LocationAccessError} from "./hardware-access.errors";

function checkLocation(): Promise<any> {

  return new Promise((resolve: (value?: any) => void, reject: (reason?: Error) => void): void => {

    window["cordova"].plugins.diagnostic.getLocationAuthorizationStatus(function(status: string): void {

      if (status == window["cordova"].plugins.diagnostic.permissionStatus.DENIED){
        reject(new LocationAccessError("Can not use location: Permission denied"));
      } else {
        resolve();
      }
    }, (msg: string) => {
      reject(new LocationAccessError(msg));
    });
  });
}

