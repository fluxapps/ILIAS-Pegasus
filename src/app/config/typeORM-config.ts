/** angular */
import {Injectable} from "@angular/core";
/** entries */
import {NewsEntity} from "../entity/news.entity";
import {UserEntity} from "../entity/user.entity";
import { LearnplaceEntity, LocationEntity, MapEntity, VisitJournalEntity } from "../entity/learnplace/learnplace.entity";
import {LinkblockEntity} from "../entity/learnplace/linkblock.entity";
import {PictureBlockEntity} from "../entity/learnplace/pictureBlock.entity";
import {TextblockEntity} from "../entity/learnplace/textblock.entity";
import {VideoBlockEntity} from "../entity/learnplace/videoblock.entity";
import {VisibilityEntity} from "../entity/learnplace/visibility.entity";
import {AccordionEntity} from "../entity/learnplace/accordion.entity";
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
