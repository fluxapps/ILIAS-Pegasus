import {NgModule, ErrorHandler, FactoryProvider} from "@angular/core";
import {IonicApp, IonicModule, IonicErrorHandler, NavController} from "ionic-angular";
import { MyApp } from "./app.component";
import {HttpModule, Http} from "@angular/http";
import {ConnectionService} from "../services/ilias-app.service";
import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {FooterToolbarService} from "../services/footer-toolbar.service";
import {FileService} from "../services/file.service";
import {DataProvider} from "../providers/data-provider.provider";
import {ObjectListPage} from "../pages/object-list/object-list";
import {FavoritesPage} from "../pages/favorites/favorites";
import {NewObjectsPage} from "../pages/new-objects/new-objects";
import {SettingsPage} from "../pages/settings/settings";
import {InfoPage} from "../pages/info/info";
import {MapPage} from "../learnplace/pages/map/map.component";
import {SynchronizationService} from "../services/synchronization.service";
import {DataProviderFileObjectHandler} from "../providers/handlers/file-object-handler";
import {FileSizePipe} from "../pipes/fileSize.pipe";
import {TranslateModule} from "ng2-translate/ng2-translate";
import {TranslateLoader, TranslateStaticLoader} from "ng2-translate/src/translate.service";
import {ObjectDetailsPage} from "../pages/object-details/object-details";
import {LoginPage} from "../pages/login/login";
import {ModalPage} from "../pages/modal/modal";
import {SyncFinishedModal} from "../pages/sync-finished-modal/sync-finished-modal";
import {TokenUrlConverter} from "../services/url-converter.service";
import {BrowserModule} from "@angular/platform-browser";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {StatusBar} from "@ionic-native/status-bar";
import {FileTransfer} from "@ionic-native/file-transfer";
import {Network} from "@ionic-native/network";
import {File} from "@ionic-native/file";
import {SQLite} from "@ionic-native/sqlite";
import {Toast} from "@ionic-native/toast";
import {HttpILIASConfigFactory, ILIAS_CONFIG_FACTORY} from "../services/ilias-config-factory";
import {HttpClient} from "../providers/http";
import {CONFIG_PROVIDER, ILIASConfigProvider} from "../config/ilias-config";
import {
  ILIAS_REST, ILIASRestImpl, ILIASTokenManager,
  TOKEN_MANAGER
} from "../providers/ilias/ilias.rest";
import {OAUTH2_DATA_SUPPLIER, TOKEN_RESPONSE_CONSUMER} from "../providers/ilias/ilias.rest-api";
import {Oauth2DataSupplierImpl, TokenResponseConsumerImpl} from "../config/ilias.rest-config";
import {TabsPage} from "../learnplace/pages/tabs/tabs.component";
import {SplashScreen} from "@ionic-native/splash-screen";
import {TypeORMConfigurationAdapter} from "../config/typeORM-config";
import {DATABASE_CONFIGURATION_ADAPTER, DatabaseConnectionRegistry} from "../services/database/database.api";
import {Database} from "../services/database/database";
import {DB_MIGRATION, MIGRATION_SUPPLIER} from "../services/migration/migration.api";
import {SimpleMigrationSupplier, TypeOrmDbMigration} from "../services/migration/migration.service";
import {
  LEARNPLACE_LOADER, LearnplaceLoader,
  RestLearnplaceLoader
} from "../learnplace/services/loader/learnplace";
import {
  LEARNPLACE_REPOSITORY,
  TypeORMLearnplaceRepository
} from "../learnplace/providers/repository/learnplace.repository";
import {MAP_REPOSITORY, TypeORMMapRepository} from "../learnplace/providers/repository/map.repository";
import {ILIASLearnplaceAPI, LEARNPLACE_API} from "../learnplace/providers/rest/learnplace.api";
import {
  AfterVisitPlaceStrategy,
  AlwaysStrategy, NeverStrategy,
  OnlyAtPlaceStrategy
} from "../learnplace/services/visibility/visibility.strategy";
import {VisibilityStrategyApplier} from "../learnplace/services/visibility/visibility.context";
import {MAP_SERVICE, VisibilityManagedMapService} from "../learnplace/services/map.service";
import {BLOCK_SERVICE, VisibilityManagedBlockService} from "../learnplace/services/block.service";
import {ContentPage} from "../learnplace/pages/content/content.component";
import {TextBlock} from "../learnplace/directives/textblock/textblock.directive";
import {WifiFallbackScreen} from "./fallback/wifi/wifi-fallback.component";
import {LocationFallbackScreen} from "./fallback/location/location-fallback.component";
import {RoamingFallbackScreen} from "./fallback/roaming/roaming-fallback.component";
import {PegasusErrorHandler} from "./error-handler";
import {HardwareFeaturePage} from "../pages/test-hardware-feature/test-hardware-feature";
import {Diagnostic} from "@ionic-native/diagnostic";
import {DiagnosticUtil} from "../services/device/hardware-features/diagnostics.util";
import {Hardware} from "../services/device/hardware-features/hardware-feature.service";
import {PictureBlock} from "../learnplace/directives/pictureblock/pictureblock.directive";
import {PictureBlockModal} from "../learnplace/directives/pictureblock/pictureblock.modal";
import {
  LinkBlockMapper, PictureBlockMapper, TextBlockMapper,
  VideoBlockMapper, VisitJournalMapper
} from "../learnplace/services/loader/mappers";
import {
  TypeORMVisitJournalRepository,
  VISIT_JOURNAL_REPOSITORY
} from "../learnplace/providers/repository/visitjournal.repository";
import {
  VISIT_JOURNAL_SYNCHRONIZATION,
  VisitJournalSynchronizationImpl
} from "../learnplace/services/visitjournal.synchronize";
import {OpenLearnplaceAction, OpenLearnplaceActionFunction} from "../actions/open-learnplace-action";
import {Geolocation} from "@ionic-native/geolocation";
import {VideoBlock} from "../learnplace/directives/videoblock/videoblock.directive";


export function createTranslateLoader(http: Http): TranslateStaticLoader {
  return new TranslateStaticLoader(http, "./assets/i18n", ".json");
}

@NgModule({
  declarations: [
    MyApp,
    ObjectListPage,
    FavoritesPage,
    NewObjectsPage,
    SettingsPage,
    InfoPage,
    ObjectDetailsPage,
    LoginPage,
    FileSizePipe,
    SyncFinishedModal,
    ModalPage,

    /* from src/learnplace */
    MapPage,
    TabsPage,
    ContentPage,

    TextBlock,
    PictureBlock,
    PictureBlockModal,
    VideoBlock,

    /* fallback screens */
    WifiFallbackScreen,
    LocationFallbackScreen,
    RoamingFallbackScreen,

    HardwareFeaturePage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    BrowserModule,
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ObjectListPage,
    FavoritesPage,
    NewObjectsPage,
    SettingsPage,
    InfoPage,
    ObjectDetailsPage,
    LoginPage,
    SyncFinishedModal,

    /* from src/learnplace */
    MapPage,
    TabsPage,
    ContentPage,
    PictureBlockModal,

    /* fallback screens */
    WifiFallbackScreen,
    LocationFallbackScreen,
    RoamingFallbackScreen,

    HardwareFeaturePage
  ],
  providers: [
    {
      provide: ILIAS_CONFIG_FACTORY,
      useClass: HttpILIASConfigFactory
    },

    /* from src/config/ilias-config */
    {
      provide: CONFIG_PROVIDER,
      useClass: ILIASConfigProvider
    },

    /* from src/providers/ilias/lias.rest */
    {
      provide: TOKEN_MANAGER,
      useClass: ILIASTokenManager
    },
    {
      provide: ILIAS_REST,
      useClass: ILIASRestImpl
    },

    /* from src/config/ilias.rest-config */
    {
      provide: OAUTH2_DATA_SUPPLIER,
      useClass: Oauth2DataSupplierImpl
    },
    {
      provide: TOKEN_RESPONSE_CONSUMER,
      useClass: TokenResponseConsumerImpl
    },

    /* from src/services/migration/migration.service */
    /* from src/services/migration/migration.api */
    {
      provide: DB_MIGRATION,
      useClass: TypeOrmDbMigration
    },

    {
      provide: MIGRATION_SUPPLIER,
      useClass: SimpleMigrationSupplier
    },

    /* from src/services/database.service */
    {
      provide: DATABASE_CONFIGURATION_ADAPTER,
      useClass: TypeORMConfigurationAdapter
    },
    DatabaseConnectionRegistry,
    Database,

    /* from src/learnplace */
    {
      provide: LEARNPLACE_REPOSITORY,
      useClass: TypeORMLearnplaceRepository
    },
    {
      provide: MAP_REPOSITORY,
      useClass: TypeORMMapRepository
    },
    {
      provide: VISIT_JOURNAL_REPOSITORY,
      useClass: TypeORMVisitJournalRepository
    },
    {
      provide: VISIT_JOURNAL_SYNCHRONIZATION,
      useClass: VisitJournalSynchronizationImpl
    },
    {
      provide: LEARNPLACE_LOADER,
      useClass: RestLearnplaceLoader
    },
    {
      provide: LEARNPLACE_API,
      useClass: ILIASLearnplaceAPI
    },
    {
      provide: MAP_SERVICE,
      useClass: VisibilityManagedMapService
    },
    {
      provide: BLOCK_SERVICE,
      useClass: VisibilityManagedBlockService
    },
    AlwaysStrategy,
    NeverStrategy,
    OnlyAtPlaceStrategy,
    AfterVisitPlaceStrategy,
    VisibilityStrategyApplier,

    // from src/learnplace/services/loader/mappers
    TextBlockMapper,
    PictureBlockMapper,
    LinkBlockMapper,
    VideoBlockMapper,
    VisitJournalMapper,

    <FactoryProvider>{
      provide: OpenLearnplaceAction,
      useFactory: (loader: LearnplaceLoader): OpenLearnplaceActionFunction =>
        (nav: NavController, learnplaceId: number, learnplaceName: string): OpenLearnplaceAction =>
          new OpenLearnplaceAction(loader, nav, learnplaceId, learnplaceName)
      ,
      deps: [LEARNPLACE_LOADER]
    },

    ConnectionService,
    ILIASRestProvider,
    FooterToolbarService,
    DataProvider,
    FileService,
    SynchronizationService,
    DataProviderFileObjectHandler,
    TokenUrlConverter,
    StatusBar,
    InAppBrowser,
    File,
    FileTransfer,
    Network,
    SQLite,
    Toast,
    HttpClient,
    SplashScreen,
    Geolocation,

    /* from src/services/device/hardware-features */
    Diagnostic,
    DiagnosticUtil,
    Hardware,

    IonicErrorHandler,
    {provide: ErrorHandler, useClass: PegasusErrorHandler}
  ],
  exports: [
    TranslateModule
  ]
})
export class AppModule {}
