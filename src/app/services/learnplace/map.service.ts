import {MapModel} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/learnplace/repository/learnplace.repository";
import {LearnplaceEntity} from "../../entity/learnplace/learnplace.entity";
import {Observable,  from } from "rxjs";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import { switchMap } from "rxjs/operators";

/**
 * Describes a service to operate with Maps.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
export interface MapService {

  /**
   * Creates a observable map by the given {@code learnplaceObjectId}.
   *
   * @param {number} learnplaceObjectId - ILIAS object id of the learnplace
   *
   * @returns {Observable<MapModel>} an observable of the map
   */
  getMap(learnplaceObjectId: number): Observable<MapModel>

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
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  /**
   * Creates a observable map by the given {@code learnplaceObjectId}.
   *
   * The returned maps visibility is managed by the {@link VisibilityStrategy}.
   *
   * @param {number} learnplaceObjectId - ILIAS object id of the learnplace
   *
   * @returns {Observable<MapModel>} an observable of the map
   */
  getMap(learnplaceObjectId: number): Observable<MapModel> {

      return from(this.userRepository.findAuthenticatedUser())
          .pipe(
              switchMap(it => from(this.learnplaceRepository.findByObjectIdAndUserId(learnplaceObjectId, it.get().id))),
              switchMap(it => {

                  console.log("Map learnplace:", it.get());
                  const learnplace: LearnplaceEntity = it.get();

                  const map: MapModel = new MapModel(
                      learnplace.location.latitude,
                      learnplace.location.longitude,
                      learnplace.map.zoom,
                      VisibilityStrategyType[learnplace.map.visibility.value]
                  );

                  this.visibilityStrategyApplier.setLearnplace(learnplace.id);
                  return this.visibilityStrategyApplier.apply(map, VisibilityStrategyType[learnplace.map.visibility.value]);
              })
          );
  }

  /**
   * Invokes {@link VisibilityStrategyApplier#shutdown} method.
   */
  shutdown(): void {
    this.visibilityStrategyApplier.shutdown();
  }
}
