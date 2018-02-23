import {Inject, Injectable} from "@angular/core";
import {User} from "../models/user";
import {HttpClient} from "@angular/common/http";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "./ilias/ilias.rest";
import {HttpResponse} from "./http";
import {File, FileEntry, IWriteOptions} from "@ionic-native/file";

const DEFAULT_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};

@Injectable()
export class ILIASRestProvider {

    constructor(
      private readonly http: HttpClient,
      @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest,
      private readonly file: File
    ) {}

    async getAuthToken(user: User): Promise<string> {

      const response: HttpResponse = await this.iliasRest.get("/v2/ilias-app/auth-token", DEFAULT_OPTIONS);

      return response.handle(it =>
        it.json<AuthToken>(authTokenSchema).token
      );
    }

    async getDesktopData(user: User): Promise<Array<object>> {

      const response: HttpResponse = await this.iliasRest.get("/v2/ilias-app/desktop", DEFAULT_OPTIONS);

      return response.handle(it =>
        it.json<Array<DesktopData>>(desktopDataSchema)
      );
    }

    async getObjectData(parentRefId: number, user: User, recursive: boolean = false, timeout: number = 0): Promise<Array<object>> {

      const opt: ILIASRequestOptions = (recursive)? {accept: "application/json", urlParams: [["recursive", "1"]]} : DEFAULT_OPTIONS;

      const response: HttpResponse = await this.iliasRest.get(`/v2/ilias-app/objects/${parentRefId}`, opt);

      return response.handle(it =>
        it.json<Array<DesktopData>>(desktopDataSchema)
      );
    }

    async getFileData(refId: number, user: User, timeout: number = 0): Promise<object> {

      const response: HttpResponse = await this.iliasRest.get(`/v2/ilias-app/files/${refId}`, DEFAULT_OPTIONS);

      return response.handle(it =>
        it.json<FileData>(fileShema)
      );
    }

    async downloadFile(refId: number, storageLocation: string, fileName: string): Promise<FileEntry> {

      const response: HttpResponse = await this.iliasRest.get(`/v1/files/${refId}`, DEFAULT_OPTIONS);

      return response.handle<Promise<FileEntry>>(async(it) =>
        this.file.writeFile(storageLocation, fileName, it.text(), <IWriteOptions>{replace: true})
      );
    }
}

interface AuthToken {
  token: string
}

const authTokenSchema: object = {
  "title": "auth-token",
  "type": "object",
  "properties": {
    "token": {
      "type": "string",
    },
    "required": ["token"]
  }
};

interface DesktopData {
  objId: string
  title: string
  description: string
  hasPageLayout: boolean
  hasTimeline: boolean
  permissionType: string
  refId: string
  parentRefId: string
  type: string
  link: string
  repoPath: Array<string>
}

const desktopDataSchema: object = {
  "title": "desktop-data",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "objId": {"type": "string"},
      "title": {"type": "string"},
      "description": {"type": "string"},
      "hasPageLayout": {"type": "boolean"},
      "hasTimeline": {"type": "boolean"},
      "permissionType": {"type": "string"},
      "refId": {"type": "string"},
      "parentRefId": {"type": "string"},
      "type": {"type": "string"},
      "link": {"type": "string"},
      "repoPath": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": ["objId", "title", "description", "hasPageLayout", "hasTimeline",
      "permissionType", "refId", "parentRefId", "type", "link", "repoPath"]
  }
};

interface FileData {
  fileExtension: string
  fileName: string
  fileSize: string
  fileType: string
  fileVersion: string
  fileVersionDate: string
}

const fileShema: object = {
  "title": "file-data",
  "type": "object",
  "properties": {
    "fileExtension": {"type": "string"},
    "fileName": {"type": "string"},
    "fileSize": {"type": "string"},
    "fileType": {"type": "string"},
    "fileVersion": {"type": "string"},
    "fileVersionDate": {"type": "string"}
  },
  "required": ["fileExtension", "fileName", "fileSize", "fileType", "fileVersion", "fileVersionDate"]
};
