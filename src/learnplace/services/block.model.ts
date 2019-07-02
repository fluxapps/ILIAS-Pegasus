/** angular */
import {SafeHtml} from "@angular/platform-browser";
/** visibilities */
import {VisibilityAware} from "./visibility/visibility.context";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
/** misc */
import {Observable} from "rxjs/Observable";

/**
 * Contains information to display a map.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class MapModel implements VisibilityAware {

  constructor(
    readonly latitude: number,
    readonly longitude: number,
    readonly zoom: number,
    private readonly visibility: VisibilityStrategyType,
    public visible: boolean = false,
  ) {}

  /**
   * Determines the language variable by considering the
   * {@code visibility} property.
   *
   * @return {string} the according language variable
   */
  getDescriptionLangVar(): string {
    switch (this.visibility) {
      case VisibilityStrategyType.NEVER:
        return "learnplace.map.no_map";
      case VisibilityStrategyType.ALWAYS:
        return "";
      default:
        return "learnplace.map.too_far_away";
    }
  }
}

/**
 * Enumerator for all available block types.
 *
 * @author nmaerchy <nm@studer-raiann.ch>
 * @since 2.0.0
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
  ILIAS_LINK,
  ACCORDION
}

/**
 * Base class for all specific block types. Shares common attributes over all blocks.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class BlockModel implements VisibilityAware {

 constructor(
   readonly sequence: number,
   public visible: boolean = false,
   private readonly type: BlockType
 ) {}

 isRichtext(): boolean {return this.type === BlockType.RICHTEXT}

 isPicture(): boolean {return this.type === BlockType.PICTURE}

 isVideo(): boolean {return this.type === BlockType.VIDEO}

 isLink(): boolean {return this.type == BlockType.ILIAS_LINK}

 isAccordion(): boolean {return this.type == BlockType.ACCORDION}
}

/**
 * Model class for a text block.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class TextBlockModel extends BlockModel {

  constructor(
    sequence: number,
    readonly content: SafeHtml,
  ) {super(sequence, false, BlockType.RICHTEXT)}
}

/**
 * Model class for a picture block.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class PictureBlockModel extends BlockModel {

  constructor(
    sequence: number,
    readonly title: string,
    readonly description: string,
    readonly thumbnail: string,
    readonly url: string
  ) {super(sequence, false, BlockType.PICTURE)}
}

/**
 * Model class for link block.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class LinkBlockModel extends BlockModel {

  constructor(
    sequence: number,
    readonly refId: number
  ) {super(sequence, false, BlockType.ILIAS_LINK)}
}

/**
 * Model class for a video block
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class VideoBlockModel extends BlockModel {

  constructor(
    sequence: number,
    readonly url: string
  ) {super(sequence, false, BlockType.VIDEO)}
}

/**
 * Model class for an accordion block
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export class AccordionBlockModel extends BlockModel {

  constructor(
    sequence: number,
    readonly title: string,
    readonly expanded: boolean,
    readonly blocks: Observable<Array<BlockModel>>,
  ) {
    super(sequence, false, BlockType.ACCORDION)
  }
}
