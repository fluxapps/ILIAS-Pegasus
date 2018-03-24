/**
 * The basic request options which  are present for upload and download of data.
 */
export interface RequestOptions {

    /*
     * The request url which is used as transfer source or destination.
     */
    readonly url: string;
    /*
     * The path of the file which is used for the transfer operation.
     */
    readonly filePath: string;
    /*
     * Http headers which will be send at the beginning of the transfer as specified by the HTTP protocol.
     * Key value pairs this must be object or the http library crashes with a type error
     */
    readonly headers: {};
    /*
     * Follow redirects this option defaults to true.
     */
    readonly followRedirects: boolean;

    /*
     * The timeout of the request in seconds.
     * This defaults to no timeout.
     */
    readonly timeout: number;
}
