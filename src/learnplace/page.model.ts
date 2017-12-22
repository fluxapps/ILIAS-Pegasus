import {VisibilityAware} from "./services/visibility/visibility.context";

/**
 * Contains information to display a map.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class MapModel implements VisibilityAware {

  visible: boolean;

  constructor(
    readonly title: string,
    readonly latitude: number,
    readonly longitude: number,
    visible: boolean = false
  ) {
    this.visible = visible;
  }
}

/**
 * Enumerator for all available block types.
 *
 * @author nmaerchy <nm@studer-raiann.ch>
 * @version 1.0.0
 */
export enum BlockType {
  FEEDBACK,
  EXTERNAL_STREAM,
  PICTURE_UPLOAD,
  PICTURE,
  RICHTEXT,
  VIDEO,
  MAP,
  COMMENT,
  HORIZONTAL_LINE,
  AUDIO,
  ILIAS_LINK
}

/**
 * Base class for all specific block types. Shares commen attributes over all blocks.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
 export class Block {

   constructor(
     readonly id: number,
     readonly sequence: number,
     public visible: boolean,
     readonly type: BlockType
   ) {}
 }
