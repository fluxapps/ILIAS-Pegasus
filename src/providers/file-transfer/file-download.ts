import {HttpResponse as Response} from "@angular/common/http";
import {InjectionToken, Injectable} from "@angular/core";
import {HTTP, HTTPResponse} from "@ionic-native/http";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {HttpRequestError, HttpResponse} from "../http";
import {RequestOptions} from "./file-transfer";

export interface DownloadRequestOptions extends RequestOptions {
    /**
     * @param {string} body
     * The request body
     */
    body: string;
}

/**
 * The file downloader is responsible for downloading a file from a given url to given file.
 *
 * @version 1.0.0
 * @author Nicolas Schaefli <ns@studer-raimann.ch>
 */
export interface FileDownloader {

    /**
     * Downloads the resource specified by the url and writes it into the given file.
     *
     * @param {DownloadRequestOptions} options
     * @returns {Promise<HttpResponse>}
     *
     * @throws {HttpRequestError} Thrown if the download of the resource failed.
     */
    download(options: DownloadRequestOptions): Promise<HttpResponse>
}

export const FILE_DOWNLOADER: InjectionToken<FileDownloader> = new InjectionToken("token for file downloader");

// workaround to access the url property of the http response
// see https://ionicframework.com/docs/native/http/
interface HTTPResponseWorkaround extends HTTPResponse{
    url?: string
}

/**
 * Standard file download implementation.
 */
@Injectable()
export class FileDownloaderImpl implements FileDownloader{


    private readonly log: Logger = Logging.getLogger(FileDownloaderImpl.name);
    private requestCounter: number = 0;

    constructor(private readonly http: HTTP) {}

    /**
     * Downloads the resource specified by the url and writes it into the given file.
     *
     * @param {DownloadRequestOptions} options
     * @returns {Promise<HttpResponse>}
     *
     * @throws {HttpRequestError} Thrown if the download of the resource failed.
     */
    async download(options: DownloadRequestOptions): Promise<HttpResponse> {

        try {
            const requestId: number = this.generateRequestId();
            this.log.trace(() => `Download-${requestId}: Clear cookies for request.`);
            this.http.clearCookies();
            this.log.trace(() => `Download-${requestId}: Redirects enabled: ${options.followRedirects}`);
            this.http.disableRedirect(!options.followRedirects);
            const response: HTTPResponseWorkaround =
                (await this.http.downloadFile(options.url, options.body, options.headers, options.filePath)) as HTTPResponseWorkaround;

            this.log.trace(() => `Download-${requestId}: Transfer finished.`);

            return new HttpResponse(new Response<ArrayBuffer>({
                url: response.url,
                status: response.status,
                statusText: "",
                body: new ArrayBuffer(0),
                headers: response.headers
            }));
        }
        catch (error) {
            if(error.hasOwnProperty("error")) {
                const response: HTTPResponseWorkaround = error as HTTPResponseWorkaround;
                this.log.warn(() => `Request to "${response.url}" failed with status code: ${response.status} error: ${response.error}`);
                throw new HttpRequestError(response.status, `Request to "${response.url}" failed with error: ${response.error}`)
            }

            this.log.warn(() => `The resource download failed with error: ${JSON.stringify(error)}`);
            throw new HttpRequestError(0, `The resource download failed with error: ${JSON.stringify(error)}`);
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
