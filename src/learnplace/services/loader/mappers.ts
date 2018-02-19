import {TextblockEntity} from "../../entity/textblock.entity";
import {ILIASLinkBlock, JournalEntry, PictureBlock, TextBlock, VideoBlock} from "../../providers/rest/learnplace.pojo";
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
import {VideoBlockEntity} from "../../entity/videoblock.entity";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";

/**
 * Describes a mapper for an array.
 *
 * The mapper must ensure, that already existing local data is updated.
 * Therefore the mapper needs two sources.
 * - local, which corresponds to {@code K}
 * - remote, which corresponds to {@code T}
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ArrayMapper<K, T> {

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
export class TextBlockMapper implements ArrayMapper<TextblockEntity, TextBlock> {


  map(local: Array<TextblockEntity>, remote: Array<TextBlock>): Array<TextblockEntity> {

    return remote.map(textBlock =>
      findIn(local, textBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new TextblockEntity())
        .applies(function(): void {
          this.iliasId = textBlock.id;
          this.sequence = textBlock.sequence;
          this.content = textBlock.content;
          this.visibility = getVisibilityEntity(textBlock.visibility);
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
export class PictureBlockMapper implements ArrayMapper<PictureBlockEntity, PictureBlock> {

  map(local: Array<PictureBlockEntity>, remote: Array<PictureBlock>): Array<PictureBlockEntity> {
    return remote.map(pictureBlock =>
      findIn(local, pictureBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new PictureBlockEntity())
        .applies(function(): void {
          this.iliasId = pictureBlock.id;
          this.sequence = pictureBlock.sequence;
          this.title = pictureBlock.title;
          this.description = pictureBlock.description;
          this.thumbnail = pictureBlock.thumbnail;
          this.url = pictureBlock.url;
          this.visibility = getVisibilityEntity(pictureBlock.visibility);
      })
    );
  }
}

/**
 * Maps {@link ILIASLinkBlock} to {@link LinkblockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class LinkBlockMapper implements ArrayMapper<LinkblockEntity, ILIASLinkBlock> {

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
      findIn(local, linkBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new LinkblockEntity())
        .applies(function(): void {
          this.iliasId = linkBlock.id;
          this.sequence = linkBlock.sequence;
          this.refId = linkBlock.refId;
          this.visibility = getVisibilityEntity(linkBlock.visibility);
      })
    );
  }
}

/**
 * Maps {@link VideoBlock} to {@link VideoBlockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class VideoBlockMapper implements ArrayMapper<VideoBlockEntity, VideoBlock> {

  /**
   * Maps the given {@code remote} video blocks to {@link VideoBlockEntity}
   * by considering the given {@code local} entity array to find existing video blocks.
   *
   * If the {@code VideoBlockEntity#iliasId} property matches the {@code VideoBlock#id} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * @param {Array<VideoBlockEntity>} local - the entities to search for existing video blocks
   * @param {Array<VideoBlock>} remote - the video blocks to update / create
   *
   * @returns {Array<VideoBlockEntity>} the resulting mapped entity array
   */
  map(local: Array<VideoBlockEntity>, remote: Array<VideoBlock>): Array<VideoBlockEntity> {
    return remote.map(videoBlock =>
      findIn(local, videoBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new VideoBlockEntity())
        .applies(function(): void {
          this.iliasId = videoBlock.id;
          this.sequence = videoBlock.sequence;
          this.url = videoBlock.url;
          this.hash = videoBlock.hash;
          this.visibility = getVisibilityEntity(videoBlock.visibility);
      }));
  }
}

/**
 * Maps {@link JournalEntry} to {@link VisitJournalEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class VisitJournalMapper implements ArrayMapper<VisitJournalEntity, JournalEntry> {

  /**
   * Maps the given {@code remote} journal entries to {@link VisitJournalEntity}
   * by considering the given {@code local} entity array to find existing journal entries.
   *
   * If the {@code VisitJournalEntity#username} property matches the {@code JournalEntry#username} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * @param {Array<VisitJournalEntity>} local - the entities to search for existing journal entries
   * @param {Array<JournalEntry>} remote - the journal entries to create / update
   *
   * @returns {Array<VisitJournalEntity>} the resulting mapped entity array
   */
  map(local: Array<VisitJournalEntity>, remote: Array<JournalEntry>): Array<VisitJournalEntity> {
    return remote.map(journalEntry =>
      findIn(local, journalEntry, (entity, journal) => entity.username == journal.username)
        .orElse(new VisitJournalEntity())
        .applies(function(): void {
          this.username = journalEntry.username;
          this.time = journalEntry.timestamp;
          this.synchronized = true;
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
