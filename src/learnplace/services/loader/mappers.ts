import {TextblockEntity} from "../../entity/textblock.entity";
import {
  AccordionBlock, ILIASLinkBlock, JournalEntry, PictureBlock, TextBlock,
  VideoBlock
} from "../../providers/rest/learnplace.pojo";
import {PictureBlockEntity} from "../../entity/pictureBlock.entity";
import {isNullOrUndefined} from "util";
import {VisibilityEntity} from "../../entity/visibility.entity";
import {Optional} from "../../../util/util.optional";
import {Inject, Injectable} from "@angular/core";
import {LinkblockEntity} from "../../entity/linkblock.entity";
import {VideoBlockEntity} from "../../entity/videoblock.entity";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
import {RESOURCE_TRANSFER, ResourceTransfer} from "./resource";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {File} from "@ionic-native/file";
import {Platform} from "ionic-angular";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {AccordionEntity} from "../../entity/accordion.entity";

/**
 * Describes a mapper for an array.
 *
 * The mapper must ensure, that already existing local data is updated.
 * Therefore the mapper needs two sources.
 * - local, which corresponds to {@code K}
 * - remote, which corresponds to {@code T}
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
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
   * @returns {Promise<Array<K>>} the resulting mapped array
   */
  map(local: Array<K>, remote: Array<T>): Promise<Array<K>>
}

/**
 * Maps a {@link TextBlock} to {@link TextblockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class TextBlockMapper implements ArrayMapper<TextblockEntity, TextBlock> {

  private readonly log: Logger = Logging.getLogger(TextBlockMapper.name);

  /**
   * Maps the given {@code remote} text blocks to {@link TextblockEntity}
   * by considering the given {@code local} entity array to find existing text blocks.
   *
   * If the {@code TextblockEntity#iliasId} property matches the {@code TextBlock#id} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * @param {Array<LinkblockEntity>} local - the entities to search in for existing text blocks
   * @param {Array<ILIASLinkBlock>} remote - the text blocks to save / update
   *
   * @returns {Promise<Array<LinkblockEntity>>} the resulting mapped entity array
   */
  async map(local: Array<TextblockEntity>, remote: Array<TextBlock>): Promise<Array<TextblockEntity>> {

    this.log.trace(() => "Map TextBlock to TextblockEntity");

    return remote.map(textBlock =>
      findIn(local, textBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new TextblockEntity())
        .applies(function (): void {
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
 * @version 1.0.0
 */
@Injectable()
export class PictureBlockMapper implements ArrayMapper<PictureBlockEntity, PictureBlock> {

  private readonly log: Logger = Logging.getLogger(PictureBlockMapper.name);

  constructor(
    @Inject(RESOURCE_TRANSFER) private readonly resourceTransfer: ResourceTransfer,
    private readonly file: File,
    private readonly platform: Platform
  ) {}

  /**
   * Maps the given {@code remote} picture blocks to {@link PictureBlockEntity}
   * by considering the given {@code local} entity array to find existing picture blocks.
   *
   * If the {@code PictureBlockEntity#iliasId} property matches the {@code PictureBlock#id} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * If the {@code PictureBlockEntity#thumbnailHash} or {@code PictureBlockEntity#hash} does not match
   * the {@code PictureBlock#thumbnailHash} or {@code PictureBlock#hash} property the according picture
   * will be downloaded and saved by the {@link ResourceTransfer}.
   *
   * @param {Array<LinkblockEntity>} local - the entities to search in for existing picture blocks
   * @param {Array<ILIASLinkBlock>} remote - the picture blocks to save / update
   *
   * @returns {Promise<Array<LinkblockEntity>>} the resulting mapped entity array
   */
  async map(local: Array<PictureBlockEntity>, remote: Array<PictureBlock>): Promise<Array<PictureBlockEntity>> {

    this.log.trace(() => "Map PictureBlock to PictureBlockEntity");

    const result: Array<PictureBlockEntity> = [];

    for(const pictureBlock of remote) {

      const entity: PictureBlockEntity = findIn(local, pictureBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new PictureBlockEntity());

      if (entity.thumbnailHash != pictureBlock.thumbnailHash) {
        this.log.trace(() => `Hash of thumbnail does not match: Download thumbnail ${pictureBlock.thumbnail}`);
        const oldThumbnail: string = entity.thumbnail;
        entity.thumbnail = await this.resourceTransfer.transfer(pictureBlock.thumbnail);
        await this.removeFile(oldThumbnail);
      }

      if (entity.hash != pictureBlock.hash) {
        this.log.trace(() => `Hash of picture does not match: Download picture ${pictureBlock.url}`);
        const oldUrl: string = entity.url;
        entity.url = await this.resourceTransfer.transfer(pictureBlock.url);
        await this.removeFile(oldUrl);
      }

      entity.applies(function(): void {
        this.iliasId = pictureBlock.id;
        this.sequence = pictureBlock.sequence;
        this.title = pictureBlock.title;
        this.description = pictureBlock.description;
        this.thumbnailHash = pictureBlock.thumbnailHash;
        this.hash = pictureBlock.hash;
        this.visibility = getVisibilityEntity(pictureBlock.visibility);
      });

      result.push(entity);
    }

    return result;
  }

  private async removeFile(path: string | undefined): Promise<void> {

    // if path is undefined, there was never a picture before to remove
    if (!isUndefined(path)) {
      const fileName: string = path.split("/").pop();
      const pathOnly: string = path.replace(fileName, "");

      await this.file.removeFile(`${this.getStorageLocation()}${pathOnly}`, fileName);
    }
  }

  private getStorageLocation(): string {
    if (this.platform.is("android")) {
      return this.file.externalApplicationStorageDirectory;
    }
    if (this.platform.is("ios")) {
      return this.file.dataDirectory;
    }

    throw new Error("Unsupported platform. Can not return a storage location.");
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

  private readonly log: Logger = Logging.getLogger(LinkBlockMapper.name);

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
   * @returns {Promise<Array<LinkblockEntity>>} the resulting mapped entity array
   */
  async map(local: Array<LinkblockEntity>, remote: Array<ILIASLinkBlock>): Promise<Array<LinkblockEntity>> {

    this.log.trace(() => "Map ILIASLinkBlock to LinkBlockEntity");

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
 * @version 2.0.0
 */
@Injectable()
export class VideoBlockMapper implements ArrayMapper<VideoBlockEntity, VideoBlock> {

  private readonly log: Logger = Logging.getLogger(VideoBlockMapper.name);

  constructor(
    @Inject(RESOURCE_TRANSFER) private readonly resourceTransfer: ResourceTransfer,
    private readonly file: File,
    private readonly platform: Platform
  ) {}

  /**
   * Maps the given {@code remote} video blocks to {@link VideoBlockEntity}
   * by considering the given {@code local} entity array to find existing video blocks.
   *
   * If the {@code VideoBlockEntity#iliasId} property matches the {@code VideoBlock#id} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * If the {@code VideoBlockEntity#hash} does not match the {@code VideoBlock#hash} property
   * the according video will be downloaded and saved by the {@link ResourceTransfer}.
   *
   * @param {Array<VideoBlockEntity>} local - the entities to search for existing video blocks
   * @param {Array<VideoBlock>} remote - the video blocks to update / create
   *
   * @returns {Promise<Array<VideoBlockEntity>>} the resulting mapped entity array
   */
  async map(local: Array<VideoBlockEntity>, remote: Array<VideoBlock>): Promise<Array<VideoBlockEntity>> {

    this.log.trace(() => "Map VideoBlock to VideoBlockEntity");

    const result: Array<VideoBlockEntity> = [];

    for(const videoBlock of remote) {

      const entity: VideoBlockEntity = findIn(local, videoBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new VideoBlockEntity());

      if (entity.hash != videoBlock.hash) {
        this.log.trace(() => `Hash of video does not match: Download video ${videoBlock.url}`);
        const oldUrl: string = entity.url;
        entity.url = await this.resourceTransfer.transfer(videoBlock.url);
        await this.removeFile(oldUrl);
      }

      entity.applies(function(): void {
        this.iliasId = videoBlock.id;
        this.sequence = videoBlock.sequence;
        this.hash = videoBlock.hash;
        this.visibility = getVisibilityEntity(videoBlock.visibility);
      });

      result.push(entity);
    }

    return result;
  }

  private async removeFile(path: string | undefined): Promise<void> {

    // if path is undefined, there was never a picture before to remove
    if (!isUndefined(path)) {
      const fileName: string = path.split("/").pop();
      const pathOnly: string = path.replace(fileName, "");

      await this.file.removeFile(`${this.getStorageLocation()}${pathOnly}`, fileName);
    }
  }

  private getStorageLocation(): string {
    if (this.platform.is("android")) {
      return this.file.externalApplicationStorageDirectory;
    }
    if (this.platform.is("ios")) {
      return this.file.dataDirectory;
    }

    throw new Error("Unsupported platform. Can not return a storage location.");
  }
}

/**
 * Maps {@link AccordionBlock} to {@link AccordionEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class AccordionMapper implements ArrayMapper<AccordionEntity, AccordionBlock> {

  private readonly log: Logger = Logging.getLogger(AccordionMapper.name);

  constructor(
    private readonly textBlockMapper: TextBlockMapper,
    private readonly pictureBlockMapper: PictureBlockMapper,
    private readonly linkBlockMapper: LinkBlockMapper,
    private readonly videoBlockMapper: VideoBlockMapper
  ) {}

  /**
   * Maps the given {@code remote} accordion blocks to {@link AccordionEntity}
   * by considering the given {@code local} entity array to find existing accordion blocks.
   *
   * If the {@code AccordionEntity#iliasId} property matches the {@code AccordionBlock#id} property
   * the entity will be updated, otherwise a new entity will be created.
   *
   * The according mappers are used in order to map all other block types inside the accordion.
   * @see TextBlockMapper, PictureBlockMapper, LinkBlockMapper, VideoBlockMapper
   *
   * @param {Array<AccordionEntity>} local - the entities to search for existing accordion blocks
   * @param {Array<AccordionBlock>} remote - the accordion blocks to update / create
   *
   * @returns {Promise<Array<AccordionEntity>>} the resulting mapped entity array
   */
  async map(local: Array<AccordionEntity>, remote: Array<AccordionBlock>): Promise<Array<AccordionEntity>> {

    this.log.trace(() => "Map AccordionBlock to AccordionEntity");

    const result: Array<AccordionEntity> = [];

    for (const accordionBlock of remote) {

      const entity: AccordionEntity = findIn(local, accordionBlock, (entity, block) => entity.iliasId == block.id)
        .orElse(new AccordionEntity());

      entity.iliasId = accordionBlock.id;
      entity.sequence = accordionBlock.sequence;
      entity.title = accordionBlock.title;
      entity.expanded = accordionBlock.expanded;
      entity.visibility = getVisibilityEntity(accordionBlock.visibility);
      entity.textBlocks = await this.textBlockMapper.map(entity.textBlocks, accordionBlock.text);
      entity.pictureBlocks = await this.pictureBlockMapper.map(entity.pictureBlocks, accordionBlock.picture);
      entity.linkBlocks = await this.linkBlockMapper.map(entity.linkBlocks, accordionBlock.iliasLink);
      entity.videoBlocks = await this.videoBlockMapper.map(entity.videoBlocks, accordionBlock.video);

      result.push(entity);
    }

    return result;
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

  private readonly log: Logger = Logging.getLogger(VisitJournalMapper.name);

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
   * @returns {Promise<Array<VisitJournalEntity>>} the resulting mapped entity array
   */
  async map(local: Array<VisitJournalEntity>, remote: Array<JournalEntry>): Promise<Array<VisitJournalEntity>> {

    this.log.trace(() => "Map JournalEntry to VisitJournalEntity");

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

function findIn<K, T>(source: Array<K>, target: T, comparator: (source: K, target: T) => boolean): Optional<K> {
  if (isNullOrUndefined(source)) {
    return Optional.empty();
  }
  return Optional.ofNullable(source.find(it => comparator(it, target)));
}

function getVisibilityEntity(visibility: string): VisibilityEntity {
  return new VisibilityEntity().applies(function(): void {
    this.value = visibility;
  });
}
