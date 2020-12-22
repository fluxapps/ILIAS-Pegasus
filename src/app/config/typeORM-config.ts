/** angular */
import {Injectable} from "@angular/core";
/** entries */
import {NewsEntity} from "../entity/news.entity";
import {UserEntity} from "../entity/user.entity";
import { LearnplaceEntity, LocationEntity, MapEntity, VisitJournalEntity } from "../learnplace/entity/learnplace.entity";
import {LinkblockEntity} from "../learnplace/entity/linkblock.entity";
import {PictureBlockEntity} from "../learnplace/entity/pictureBlock.entity";
import {TextblockEntity} from "../learnplace/entity/textblock.entity";
import {VideoBlockEntity} from "../learnplace/entity/videoblock.entity";
import {VisibilityEntity} from "../learnplace/entity/visibility.entity";
import {AccordionEntity} from "../learnplace/entity/accordion.entity";
/** misc */
import {isDevMode} from "../devmode";
import {DatabaseConfigurationAdapter, DatabaseConnectionRegistry} from "../services/database/database.api";

export const PEGASUS_CONNECTION_NAME: string = "ilias-pegasus";

/**
 * Configuration adapter for typeORM connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
@Injectable({
    providedIn: "root"
})
export class TypeORMConfigurationAdapter implements DatabaseConfigurationAdapter {

    /**
     * Adds the {@link PEGASUS_CONNECTION_NAME} to the registry.
     *
     * @param {DatabaseConnectionRegistry} registry - the database connection registry
     */
    addConnections(registry: DatabaseConnectionRegistry): void {
        registry.addConnection(PEGASUS_CONNECTION_NAME,
            it => it.cordova()
                .setDatabase("ilias_app")
                .setLocation("default")
                .enableLogging(isDevMode())
                .addEntity(
                    LocationEntity,
                    LearnplaceEntity,
                    MapEntity,
                    VisibilityEntity,
                    TextblockEntity,
                    PictureBlockEntity,
                    VideoBlockEntity,
                    LinkblockEntity,
                    AccordionEntity,
                    VisitJournalEntity,
                    UserEntity,
                    NewsEntity
                )
        );
    }
}
