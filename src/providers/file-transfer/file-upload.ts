import {HttpResponse as Response} from "@angular/common/http";
import {InjectionToken, Injectable} from "@angular/core";
import {HTTP, HTTPResponse} from "@ionic-native/http";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {HttpRequestError, HttpResponse} from "../http";
import {RequestOptions} from "./file-transfer";

export interface UploadRequestOptions extends RequestOptions {

    /**
     * The name of the resource which is uploaded.
     */
    readonly name: string;
}

/**
 * The file uploader is responsible for uploading a file to the given url.
 *
 * @version 1.0.0
 * @author Nicolas Schaefli <ns@studer-raimann.ch>
 */
export interface FileUploader {

    /**
     * Uploads a resource to the given url with the specified name.
     *
     * @param {UploadRequestOptions} options
     * @returns {Promise<HttpResponse>}
     *
     * @throws {HttpRequestError} Thrown if the download of the resource failed.
     */
    upload(options: UploadRequestOptions): Promise<HttpResponse>
}

export const FILE_UPLOADER: InjectionToken<FileUploader> = new InjectionToken("token for file uploader");

// workaround to access the url property of the http response
// see https://ionicframework.com/docs/native/http/
interface HTTPResponseWorkaround extends HTTPResponse{
    url: string
}

/**
 * Standard file download implementation.
 */
@Injectable()
export class FileUploaderImpl implements FileUploader{


    private readonly log: Logger = Logging.getLogger(FileUploaderImpl.name);
    private requestCounter: number = 0;

    constructor(private readonly http: HTTP) {}

    /**
     * Uploads the given file to the specified url.
     *
     * @param {UploadRequestOptions} options
     * @returns {Promise<HttpResponse>}
     *
     * @throws {HttpRequestError} Thrown if the upload of the resource failed.
     */
    async upload(options: UploadRequestOptions): Promise<HttpResponse> {

        try {
            const requestId: number = this.generateRequestId();
            this.log.trace(() => `Upload-${requestId}: Clear cookies for request.`);
            this.http.clearCookies();
            this.log.trace(() => `Upload-${requestId}: Redirects enabled: ${options.followRedirects}`);
            this.http.disableRedirect(!options.followRedirects);
            const response: HTTPResponseWorkaround =
                (await this.http.uploadFile(options.url, "", options.headers, options.filePath, options.name)) as HTTPResponseWorkaround;
            this.log.trace(() => `Upload-${requestId}: Transfer finished.`);

            const rawResponse: string = (typeof (response.data) === "string") ? response.data.toString() : "";
            const bodyBuffer: ArrayBuffer = new ArrayBuffer(rawResponse.length);
            const bodyView: DataView = new DataView(bodyBuffer);
            for(let i: number = 0; i < rawResponse.length; i++) {
                const charCode: number = rawResponse.charCodeAt(i);
                bodyView.setInt8(i, charCode);
            }

            return new HttpResponse(new Response<ArrayBuffer>({
                url: response.url,
                status: response.status,
                statusText: "",
                body: bodyBuffer,
                headers: response.headers
            }));
        }
        catch (error) {
            if(error.hasOwnProperty("error")) {
                const response: HTTPResponseWorkaround = error as HTTPResponseWorkaround;
                this.log.warn(() => `Request to "${response.url}" failed with status code: ${response.status} error: ${response.error}`);
                throw new HttpRequestError(response.status, `Request to "${response.url}" failed with error: ${response.error}`)
            }

            this.log.warn(() => `The resource upload failed with error: ${JSON.stringify(error)}`);
            throw new HttpRequestError(0, `The resource upload failed with error: ${JSON.stringify(error)}`);
        }

    }

    /**
     * Generates the request id which is used to distinguish the logs of the different running requests.
     * This method is save integer overflow aware.
     *
     * @returns {number} The request id of the current request.
     */
    private generateRequestId(): number {
        if(this.requestCounter === Number.MAX_SAFE_INTEGER)
            this.requestCounter = 0;

        return ++this.requestCounter;
    }
}
