import {File} from "@ionic-native/file";
import {Injectable} from "@angular/core";

/**
 * Encode and decodes files from url.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class Base64 {

  constructor(
    private readonly file: File
  ) {}

  /**
   * Reads the given url as text and decodes it with Base64.
   *
   * @param {string} url - a file url
   *
   * @returns {Promise<Base64EncodedData>} data object for the encoded content
   */
  async encode(url: string): Promise<Base64EncodedData> {

    const urlFragments: Array<string> = url.split("/");
    const fileName: string = urlFragments.pop();
    const path: string = url.replace(fileName, "");

    const fileData: string = await this.file.readAsText(path, fileName);

    return new Base64EncodedData(getDataType(fileName), btoa(fileData));
  }
}

/**
 * Contains data of a Base64 encoded file.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class Base64EncodedData {

  constructor(
    readonly data: string,
    readonly value: string
  ) {}

  /**
   * @returns {string} an embedded string value of the file, e.g. data:image/png;base64,SGVsbG8gV29ybGQh
   */
  embedded(): string {
    return `data:${this.data};base64,${this.value}`;
  }
}

/**
 * Returns the data type of the given file name.
 * e.g. image/png
 *
 * @param {string} fileName - file name to get its data type
 *
 * @returns {string} the resulting data type
 * @throws {Error} if the file suffix is not supported
 */
function getDataType(fileName: string): string {

  const nameFragments: Array<string> = fileName.split(".");
  const suffix: string = nameFragments.pop();

  switch (suffix) {
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpg";
    case "jpeg":
      return "image/jpeg";
  }

  throw new Error(`File Suffix is not supported: suffix=${suffix}`);
}
