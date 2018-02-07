import {TextblockEntity} from "../../entity/textblock.entity";
import {ILIASLinkBlock, PictureBlock, TextBlock} from "../../providers/rest/learnplace.pojo";
import {PictureBlockEntity} from "../../entity/pictureBlock.entity";
import {isNullOrUndefined} from "util";
import {VisibilityEntity} from "../../entity/visibility.entity";
import {apply} from "../../../util/util.function";
import {Optional} from "../../../util/util.optional";
import {FileTransfer} from "@ionic-native/file-transfer";
import {LearnplaceData} from "./learnplace";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {User} from "../../../models/user";
import {Injectable} from "@angular/core";
import {LinkblockEntity} from "../../entity/linkblock.entity";

/**
 * Describes a mapper for a specific block type.
 *
 * The mapper must ensure, that already existing local data is updated.
 * Therefore the mapper needs two sources.
 * - local, which corresponds to {@code K}
 * - remote, which corresponds to {@code T}
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface BlockMapper<K, T> {

  /**
   * Maps the given {@code remote} array to
   * an array of type {@code K}.
   *
   * The given {@link local} array is provided
   * in order to compare remote and local
   * and update already existing local data.
   *
   * @param {Array<K>} local - the local data to compare
   * @param {Array<T>} remote - the remote data to compare
   *
   * @returns {Array<K>} the resulting mapped array
   */
  map(local: Array<K>, remote: Array<T>): Array<K>
}

/**
 * Maps a {@link TextBlock} to {@link TextBlockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.2
 */
@Injectable()
export class TextBlockMapper implements BlockMapper<TextblockEntity, TextBlock> {


  map(local: Array<TextblockEntity>, remote: Array<TextBlock>): Array<TextblockEntity> {

    return remote.map(textBlock =>
      // TODO: use unique identifier to compare
      apply(findIn(local, textBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new TextblockEntity()), it => {
        it.iliasId = textBlock.id;
        it.sequence = textBlock.sequence;
        it.content = textBlock.content;
        it.visibility = getVisibilityEntity(textBlock.visibility);
      })
    );
  }
}

/**
 * Maps {@link PictureBlock} to {@link PictureBlockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class PictureBlockMapper implements BlockMapper<PictureBlockEntity, PictureBlock> {

  map(local: Array<PictureBlockEntity>, remote: Array<PictureBlock>): Array<PictureBlockEntity> {
    return remote.map(pictureBlock =>
      apply(findIn(local, pictureBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new PictureBlockEntity()), it => {
        it.iliasId = pictureBlock.id;
        it.sequence = pictureBlock.sequence;
        it.title = pictureBlock.title;
        it.description = pictureBlock.description;
        it.thumbnail = pictureBlock.thumbnail;
        it.url = pictureBlock.url;
        it.visibility = getVisibilityEntity(pictureBlock.visibility);
      })
    );
  }
}

/**
 * Maps {@link ILIASLinkBlock} to {@link LinkBlockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class LinkBlockMapper implements BlockMapper<LinkblockEntity, ILIASLinkBlock> {

  /**
   * Maps the given {@code remote} link blocks to {@link LinkblockEntity}
   * by considering the given {@code local} entity array to find existing link blocks.
   *
   * If the {@code LinkblockEntity#iliasId} property matches the {@code ILIASLinkBlock#id} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * @param {Array<LinkblockEntity>} local - the entities to search in for existing link blocks
   * @param {Array<ILIASLinkBlock>} remote - the link blocks to save / update
   *
   * @returns {Array<LinkblockEntity>} the resulting mapped entity array
   */
  map(local: Array<LinkblockEntity>, remote: Array<ILIASLinkBlock>): Array<LinkblockEntity> {
    return remote.map(linkBlock =>
      apply(findIn(local, linkBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new LinkblockEntity()), it => {
        it.iliasId = linkBlock.id;
        it.sequence = linkBlock.sequence;
        it.refId = linkBlock.refId;
        it.visibility = getVisibilityEntity(linkBlock.visibility);
      })
    );
  }
}

/**
 * DO NOT USE.
 * This class was created only and only for the purpose of finishing a feature in time.
 * Do never use this class everywhere else that in this file.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class SimpleStorageLocation {

  constructor(
    private readonly platform: Platform,
    private readonly file: File
  ) {}

  async getUserStorageLocation(): Promise<string> {
    const user: User = await User.currentUser();
    if (this.platform.is("android")) {
      return `${this.file.externalApplicationStorageDirectory}ilias-app/${user.id}/`;
    } else if (this.platform.is("ios")) {
      return `${this.file.dataDirectory}${user.id}/`;
    }
  }
}

function findIn<K, T>(source: Array<K>, target: T, comparator: (source: K, target: T) => boolean): Optional<K> {
  if (isNullOrUndefined(source)) {
    return Optional.empty();
  }
  return Optional.ofNullable(source.find(it => comparator(it, target)));
}

function getVisibilityEntity(visibility: string): VisibilityEntity {
  return apply(new VisibilityEntity(), it => {
    it.value = visibility;
  })
}
