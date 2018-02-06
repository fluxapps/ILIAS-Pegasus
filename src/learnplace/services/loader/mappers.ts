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
import {isNullOrUndefined} from "util";
import {VisibilityEntity} from "../../entity/visibility.entity";
import {apply} from "../../../util/util.function";
import {Optional} from "../../../util/util.optional";

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

    return remote.map(textBlock => {
      // TODO: use unique identifier to compare
      return apply(this.findIn(local, textBlock, (entity, block) => entity.content == block.content)
        .orElse(new TextblockEntity()), it => {
        it.sequence = textBlock.sequence;
        it.content = textBlock.content;
        it.visibility = this.getVisibilityEntity(textBlock.visibility);
      })
    });
  }

  private findIn<K, T>(source: Array<K>, target: T, comparator: (source: K, target: T) => boolean): Optional<K> {
    if (isNullOrUndefined(source)) {
      return Optional.empty();
    }
    return Optional.ofNullable(source.find(it => comparator(it, target)));
  }

  private getVisibilityEntity(visibility: string): VisibilityEntity {
    return apply(new VisibilityEntity(), it => {
      it.value = visibility;
    })
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
