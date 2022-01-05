import {MapPlaceModel} from "./block.model";
import {Inject, Injectable, InjectionToken, ɵConsole} from "@angular/core";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/learnplace/repository/learnplace.repository";
import {LearnplaceEntity} from "../../entity/learnplace/learnplace.entity";
import {Observable,  from } from "rxjs";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import mapboxgl from "mapbox-gl"
import {environment} from "../../../environments/environment";
import {isDefined, isNullOrUndefined} from "../../util/util.function";

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
     * @returns {Observable<MapPlaceModel>} an observable of the map
     */
    getMapPlace(learnplaceObjectId: number): Observable<MapPlaceModel>

    /**
     * Creates observables of maps by the given {@code learnplaceObjectIds}.
     *
     * @param {Array<number>} lpObjIds - ILIAS object id of the learnplace
     *
     * @returns {Array<Observable<MapPlaceModel>>} an observable of the map
     */
    getMapPlaces(lpObjIds: Array<number>): Array<Observable<MapPlaceModel>>
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
    ) {
        if (typeof mapboxgl.accessToken !== "string" || mapboxgl.accessToken.length === 0) {
            mapboxgl.accessToken = environment.mapboxApiKey;
        }
    }

    /**
     * Creates a observable map by the given {@code learnplaceObjectId}.
     *
     * The returned maps visibility is managed by the {@link VisibilityStrategy}.
     *
     * @param {number} lpObjId - ILIAS object id of the learnplace
     *
     * @returns {Observable<MapPlaceModel>} an observable of the map
     */
    getMapPlace(lpObjId: number): Observable<MapPlaceModel> {

        return new Observable((observer) => {
            // tslint:disable-next-line: no-floating-promises
            this.learnplaceRepository.findByObjectIdAndUserId(lpObjId, AuthenticationProvider.getUser().id).then(it => {
                const learnplace: LearnplaceEntity = it.get();

                const place: MapPlaceModel = new MapPlaceModel(
                    lpObjId,
                    learnplace.location.latitude,
                    learnplace.location.longitude,
                    learnplace.map.zoom,
                    VisibilityStrategyType[learnplace.map.visibility.value]
                );

                this.visibilityStrategyApplier.setLearnplace(learnplace.id);
                this.visibilityStrategyApplier.apply(place, VisibilityStrategyType[learnplace.map.visibility.value])
                    .subscribe(place => {
                        observer.next(place)
                        observer.complete();
                    });
            });
        });
    }

    getMapPlaces(lpObjIds: Array<number>): Array<Observable<MapPlaceModel>> {
        if (!lpObjIds) {
            return;
        }

        return lpObjIds.map(id => this.getMapPlace(id));
    }
}
