import { HttpResponse } from "../providers/http";
import { Inject, Injectable } from "@angular/core";
import { User } from "../models/user";
import { ILIAS_REST, ILIASRequestOptions, ILIASRest } from "../providers/ilias/ilias.rest";
import { ILIASObject } from "../models/ilias-object";
import { DesktopData } from "../providers/ilias-rest.provider";
import { iliasObjectJsonSchema } from "../providers/learnplace/rest/json.schema";
import { Logger } from "./logging/logging.api";
import { Logging } from "./logging/logging.service";

const DEFAULT_REQUEST_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};


@Injectable({
  providedIn: 'root'
})
export class IliasObjectService {
  private log: Logger = Logging.getLogger("IliasObjectService");

  constructor(
    @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest
  ) { }

  async downloadIlObjByRefID(refIds: Array<number>): Promise<Array<ILIASObject>> {
    try {
      const user: User = await User.currentUser();
      const pendingDownloads: Array<Promise<HttpResponse>> = new Array<Promise<HttpResponse>>();
      const objNotFoundLocally: Map<number, ILIASObject> = new Map<number, ILIASObject>();

      for (const refId of refIds) {
          const localObject: ILIASObject = await ILIASObject.findByRefIdAndUserId(refId, user.id);
          if (localObject.id === 0) {
              pendingDownloads.push(
                  this.iliasRest.get(`/v3/ilias-app/object/${refId}`, DEFAULT_REQUEST_OPTIONS)
              );
              objNotFoundLocally.set(refId, localObject);
          }
      }

      const finishedDownloads: Array<HttpResponse> = await Promise.all(pendingDownloads);

      const iliasObjects: Array<DesktopData> = finishedDownloads.map(
          (response) => response.handle<DesktopData>(
              (it) => it.json(iliasObjectJsonSchema)
          )
      );
      const localObjects = [];
      for (const remoteObject of iliasObjects) {
          const localObject: ILIASObject = objNotFoundLocally.get(parseInt(remoteObject.refId, 10));
          localObject.readFromObject(remoteObject);

          await localObject.save();
          localObjects.push(localObject);
      }

      return localObjects;
    } catch (error) {
      // We can't rethrow the error because some of the installation don't have the REST Plugin upgrades jet ... (19.08.2020)
      if (!!error.prototype) {
        this.log.warn(() => `Failed to download link block related ilias objects, with error: [error=${error.prototype.name}, message="${error.message}"]`);
      }

      this.log.warn(() => `Failed to download link block related ilias objects, with error: [error=unknown, message="${error.message}"]`);

      return [];
    }
  }
}
