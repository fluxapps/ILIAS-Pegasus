import {Inject, Injectable} from "@angular/core";
import {IllegalStateError} from "../error/errors";
import {User} from "../models/user";
import {HttpClient} from "@angular/common/http";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "./ilias/ilias.rest";
import {HttpResponse} from "./http";
import {File, FileEntry, IWriteOptions, FileWriter, FileError} from "@ionic-native/file";

const DEFAULT_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};

@Injectable()
export class ILIASRestProvider {

    private readonly log: Logger = Logging.getLogger(ILIASRestProvider.name);

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

      return response.handle<Promise<FileEntry>>(
          (it) => this.writeFileJunked(it.arrayBuffer(), storageLocation, fileName)
      );
    }

    /**
     * Write content in 5MB junks to the file.
     * This is necessary due to ram spike issues while writing large files (base64 encode at the cordova js nativ exec call bridge),
     * which leads to an instant crash of the app.
     *
     * @param {ArrayBuffer} fileContent
     * @param {string} path
     * @param {string} name
     * @returns {Promise<void>}
     */
    private async writeFileJunked(fileContent: ArrayBuffer, path: string, name: string): Promise<FileEntry> {
        const blockSize: number = 5 * 1024**2; //5MB
        const writeCycles: number = Math.floor(fileContent.byteLength / blockSize);

        this.log.trace(() => `Writing file with block-size: ${blockSize}, cycles: ${writeCycles}`);
        const fileEntry: FileEntry = await this.file.writeFile(path, name, "", <IWriteOptions>{replace: true});

        for(let i: number = 0; i <= writeCycles; i++) {
            //start byte pointer
            const blockPointer: number = i * blockSize;

            //the end pointer is equal to the start + block size or the data which are left at the end of the file.
            const blockPointerEnd: number = (blockSize <= (fileContent.byteLength - blockPointer))
                ? blockPointer + blockSize
                : fileContent.byteLength - blockPointer;

            this.log.trace(() => `Writing file block ${i} start ${blockPointer} end ${blockPointerEnd}`);
            await this.writeFileJunk(fileContent.slice(blockPointer, blockPointerEnd), fileEntry, blockPointer);
        }

        return fileEntry;
    }

    private async writeFileJunk(slice: ArrayBuffer, file: FileEntry, blockPosition: number): Promise<void> {
        return new Promise<void>((resolve: Resolve<void>, reject: Reject<Error>) => {
            file.createWriter((writer: FileWriter) => {

                writer.onerror = (event: ProgressEvent): void => {reject(new Error("Unable to write file."))};
                writer.onwriteend = (event: ProgressEvent): void => resolve();
                writer.seek(blockPosition);
                writer.write(slice);

            }, (error: FileError) => {
                reject(new IllegalStateError(`Unable to write file with FileError: ${error.code} and message ${error.message}`));
            });
        });
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
