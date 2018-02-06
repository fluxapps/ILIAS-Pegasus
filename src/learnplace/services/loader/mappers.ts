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
import {TextblockEntity} from "../../entity/textblock.entity";
import {PictureBlock, TextBlock} from "../../providers/rest/learnplace.pojo";
import {PictureBlockEntity} from "../../entity/pictureBlock.entity";

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
 * @version 0.0.1
 */
export class TextBlockMapper implements BlockMapper<TextblockEntity, TextBlock> {


  map(local: Array<TextblockEntity>, remote: Array<TextBlock>): Array<TextblockEntity> {
    throw new Error("This method is not implemented yet");
  }
}

/**
 * Maps {@link PictureBlock} to {@link PictureBlockEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class PictureBlockMapper implements BlockMapper<PictureBlockEntity, PictureBlock> {


  map(local: Array<PictureBlockEntity>, remote: Array<PictureBlock>): Array<PictureBlockEntity> {
    throw new Error("This method is not implemented yet");
  }
}
