import {MapModel} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";

/**
 * Describes a service to operate with Maps.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
export interface MapService {

  /**
   * Creates a map by the given {@code learnplaceId}.
   *
   * @param {number} learnplaceId - the id of the learnplace to find the according map
   *
   * @returns {Observable<MapModel>} an observable of the map
   */
  getMap(learnplaceId: number): Observable<MapModel>

  /**
   * Shutdown every depending or async task which can be occurred by the {@link MapService#getMap} method.
   */
  shutdown(): void;
}
export const MAP_SERVICE: InjectionToken<MapService> = new InjectionToken("token for map service");

/**
 * Manages the visibility of a map by using the {@link VisibilityStrategy}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.2.0
 */
@Injectable()
export class VisibilityManagedMapService implements MapService {

  constructor(
    private readonly visibilityStrategyApplier: VisibilityStrategyApplier,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository
  ) {}

  /**
   * Creates a map by the given {@code learnplaceId}.
   *
   * The returned maps visibility is managed by the {@link VisibilityStrategy}.
   *
   * @param {number} learnplaceId - the id of the learnplace to find the according map
   *
   * @returns {Observable<MapModel>} an observable of the map
   * @throws {NoSuchElementError} if no learnplace matches the given id
   */
  getMap(learnplaceId: number): Observable<MapModel> {

    return Observable.fromPromise(this.learnplaceRepository.find(learnplaceId))
      .map(it => {

        const learnplace: LearnplaceEntity = it.get();

        const map: MapModel = new MapModel(
          "", // TODO: what title do we want
          learnplace.location.latitude,
          learnplace.location.longitude,
          learnplace.map.zoom,
          VisibilityStrategyType[learnplace.map.visibility.value]
        );

        this.visibilityStrategyApplier.setLearnplace(learnplaceId);
        return this.visibilityStrategyApplier.apply(map, VisibilityStrategyType[learnplace.map.visibility.value]);
      })
      .mergeAll();
  }

  /**
   * Invokes {@link VisibilityStrategyApplier#shutdown} method.
   */
  shutdown(): void {
    this.visibilityStrategyApplier.shutdown();
  }
}
