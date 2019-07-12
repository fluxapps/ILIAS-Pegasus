var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** angular */
import { Injectable } from "@angular/core";
/** entries */
import { NewsEntity } from "../entity/news.entity";
import { UserEntity } from "../entity/user.entity";
/*TODO lp
import {AccordionEntity} from "../learnplace/entity/accordion.entity";
import {LearnplaceEntity} from "../learnplace/entity/learnplace.entity";
import {LinkblockEntity} from "../learnplace/entity/linkblock.entity";
import {LocationEntity} from "../learnplace/entity/location.entity";
import {MapEntity} from "../learnplace/entity/map.entity";
import {PictureBlockEntity} from "../learnplace/entity/pictureBlock.entity";
import {TextblockEntity} from "../learnplace/entity/textblock.entity";
import {VideoBlockEntity} from "../learnplace/entity/videoblock.entity";
import {VisibilityEntity} from "../learnplace/entity/visibility.entity";
import {VisitJournalEntity} from "../learnplace/entity/visit-journal.entity";*/
/** misc */
import { isDevMode } from "../devmode";
export var PEGASUS_CONNECTION_NAME = "ilias-pegasus";
/**
 * Configuration adapter for typeORM connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
var TypeORMConfigurationAdapter = /** @class */ (function () {
    function TypeORMConfigurationAdapter() {
    }
    /**
     * Adds the {@link PEGASUS_CONNECTION_NAME} to the registry.
     *
     * @param {DatabaseConnectionRegistry} registry - the database connection registry
     */
    TypeORMConfigurationAdapter.prototype.addConnections = function (registry) {
        registry.addConnection(PEGASUS_CONNECTION_NAME, function (it) { return it.cordova()
            .setDatabase("ilias_app")
            .setLocation("default")
            .enableLogging(isDevMode())
            .addEntity(
        /*TODO lp LearnplaceEntity,
        LocationEntity,
        MapEntity,
        VisibilityEntity,
        TextblockEntity,
        PictureBlockEntity,
        VideoBlockEntity,
        LinkblockEntity,
        AccordionEntity,
        VisitJournalEntity,*/
        UserEntity, NewsEntity); });
    };
    TypeORMConfigurationAdapter = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], TypeORMConfigurationAdapter);
    return TypeORMConfigurationAdapter;
}());
export { TypeORMConfigurationAdapter };
//# sourceMappingURL=typeORM-config.js.map