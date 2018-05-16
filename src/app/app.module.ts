import {HttpClientModule, XhrFactory} from "@angular/common/http";
import {ClassProvider, ErrorHandler, FactoryProvider, NgModule} from "@angular/core";
import {Http, HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {Diagnostic} from "@ionic-native/diagnostic";
import {File} from "@ionic-native/file";
import {Geolocation} from "@ionic-native/geolocation";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {Network} from "@ionic-native/network";
import {PhotoViewer} from "@ionic-native/photo-viewer";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SQLite} from "@ionic-native/sqlite";
import {StatusBar} from "@ionic-native/status-bar";
import {StreamingMedia} from "@ionic-native/streaming-media";
import {Toast} from "@ionic-native/toast";
import {IonicApp, IonicErrorHandler, IonicModule, ModalController, NavController, Platform} from "ionic-angular";
import {TranslateModule, TranslateService, MissingTranslationHandler} from "ng2-translate/ng2-translate";
import {TranslateLoader, TranslateStaticLoader} from "ng2-translate/src/translate.service";
import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceAction, OpenLearnplaceActionFunction} from "../actions/open-learnplace-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../actions/open-object-in-ilias-action";
import {
    REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION, RemoveLocalLearnplaceAction,
    RemoveLocalLearnplaceActionFunction
} from "../actions/remove-local-learnplace-action";
import {CONFIG_PROVIDER, ILIASConfigProvider} from "../config/ilias-config";
import {Oauth2DataSupplierImpl, TokenResponseConsumerImpl} from "../config/ilias.rest-config";
import {TypeORMConfigurationAdapter} from "../config/typeORM-config";
import {AccordionBlock} from "../learnplace/directives/accordion/accordion.directive";
import {LinkBlock} from "../learnplace/directives/linkblock/link-block.directive";
import {PictureBlock} from "../learnplace/directives/pictureblock/pictureblock.directive";
import {TextBlock} from "../learnplace/directives/textblock/textblock.directive";
import {VideoBlock} from "../learnplace/directives/videoblock/videoblock.directive";
import {ContentPage} from "../learnplace/pages/content/content.component";
import {MapPage} from "../learnplace/pages/map/map.component";
import {TabsPage} from "../learnplace/pages/tabs/tabs.component";
import {LEARNPLACE_REPOSITORY, TypeORMLearnplaceRepository} from "../learnplace/providers/repository/learnplace.repository";
import {MAP_REPOSITORY, TypeORMMapRepository} from "../learnplace/providers/repository/map.repository";
import {TypeORMVisitJournalRepository, VISIT_JOURNAL_REPOSITORY} from "../learnplace/providers/repository/visitjournal.repository";
import {ILIASLearnplaceAPI, LEARNPLACE_API} from "../learnplace/providers/rest/learnplace.api";
import {BLOCK_SERVICE, VisibilityManagedBlockService} from "../learnplace/services/block.service";
import {LEARNPLACE_MANAGER, LearnplaceManager, LearnplaceManagerImpl} from "../learnplace/services/learnplace.management";
import {LEARNPLACE_LOADER, LearnplaceLoader, RestLearnplaceLoader} from "../learnplace/services/loader/learnplace";
import {
    AccordionMapper,
    LinkBlockMapper,
    PictureBlockMapper,
    TextBlockMapper,
    VideoBlockMapper,
    VisitJournalMapper
} from "../learnplace/services/loader/mappers";
import {HttpResourceTransfer, LEARNPLACE_PATH_BUILDER, LearnplacePathBuilderImpl, RESOURCE_TRANSFER} from "../learnplace/services/loader/resource";
import {MAP_SERVICE, VisibilityManagedMapService} from "../learnplace/services/map.service";
import {VisibilityStrategyApplier} from "../learnplace/services/visibility/visibility.context";
import {AfterVisitPlaceStrategy, AlwaysStrategy, NeverStrategy, OnlyAtPlaceStrategy} from "../learnplace/services/visibility/visibility.strategy";
import {
    SynchronizedVisitJournalWatch,
    VISIT_JOURNAL_SYNCHRONIZATION,
    VISIT_JOURNAL_WATCH,
    VisitJournalSynchronizationImpl
} from "../learnplace/services/visitjournal.service";
import {FavoritesPage} from "../pages/favorites/favorites";
import {InfoPage} from "../pages/info/info";
import {LoginPage} from "../pages/login/login";
import {ModalPage} from "../pages/modal/modal";
import {NewObjectsPage} from "../pages/new-objects/new-objects";
import {ObjectDetailsPage} from "../pages/object-details/object-details";
import {ObjectListPage} from "../pages/object-list/object-list";
import {SettingsPage} from "../pages/settings/settings";
import {SyncFinishedModal} from "../pages/sync-finished-modal/sync-finished-modal";
import {HardwareFeaturePage} from "../pages/test-hardware-feature/test-hardware-feature";
import {FileSizePipe} from "../pipes/fileSize.pipe";
import {DataProvider} from "../providers/data-provider.provider";
import {FILE_DOWNLOADER, FileDownloaderImpl} from "../providers/file-transfer/file-download";
import {FILE_UPLOADER, FileUploaderImpl} from "../providers/file-transfer/file-upload";
import {DataProviderFileObjectHandler} from "../providers/handlers/file-object-handler";
import {HttpClient as PegasusHttpClient, PegasusXhrFactory} from "../providers/http";
import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {ILIAS_REST, ILIASRestImpl, ILIASTokenManager, TOKEN_MANAGER} from "../providers/ilias/ilias.rest";
import {OAUTH2_DATA_SUPPLIER, TOKEN_RESPONSE_CONSUMER} from "../providers/ilias/ilias.rest-api";
import {NEWS_REST, NewsRestImpl} from "../providers/ilias/news.rest";
import {USER_REPOSITORY, UserRepository, UserTypeORMRepository} from "../providers/repository/repository.user";
import {Builder} from "../services/builder.base";
import {Database} from "../services/database/database";
import {DATABASE_CONFIGURATION_ADAPTER, DatabaseConnectionRegistry} from "../services/database/database.api";
import {DiagnosticUtil} from "../services/device/hardware-features/diagnostics.util";
import {Hardware} from "../services/device/hardware-features/hardware-feature.service";
import {FileService} from "../services/file.service";
import {FooterToolbarService} from "../services/footer-toolbar.service";
import {PegasusMissingTranslationHandler} from "../services/language/translation-missing-handler";
import {DEFAULT_LINK_BUILDER, DefaultLinkBuilder, DefaultLinkBuilderImpl} from "../services/link/default.builder";
import {LINK_BUILDER, LinkBuilderImpl} from "../services/link/link-builder.service";
import {
    AuthTokenSupplier,
    INSTALLATION_LINK_PROVIDER,
    InstallationLinkSupplier,
    InstallationLinkSupplierImpl,
    TOKEN_SUPPLIER,
    TokenSupplier
} from "../services/link/link-builder.supplier";
import {LOADING_LINK_BUILDER, LoadingLinkBuilder, LoadingLinkBuilderImpl} from "../services/link/loading.builder";
import {LOGIN_LINK_BUILDER, LoginLinkBuilder, LoginLinkBuilderImpl} from "../services/link/login.builder";
import {NEWS_LINK_BUILDER, NewsLinkBuilder, NewsLinkBuilderImpl} from "../services/link/news.builder";
import {RESOURCE_LINK_BUILDER, ResourceLinkBuilder, ResourceLinkBuilderImpl} from "../services/link/resource.builder";
import {TIMELINE_LINK_BUILDER, TimelineLinkBuilder, TimelineLinkBuilderImpl} from "../services/link/timeline.builder";
import {DB_MIGRATION, MIGRATION_SUPPLIER} from "../services/migration/migration.api";
import {SimpleMigrationSupplier, TypeOrmDbMigration} from "../services/migration/migration.service";
import {NEWS_SYNCHRONIZATION, NewsSynchronizationImpl} from "../services/news/news.synchronization";
import {SynchronizationService} from "../services/synchronization.service";
import {MyApp} from "./app.component";
import {PegasusErrorHandler} from "./error-handler";

import {LoadingPage} from "./fallback/loading/loading.component";
import {LocationFallbackScreen} from "./fallback/location/location-fallback.component";
import {LeaveAppDialog} from "./fallback/open-browser/leave-app.dialog";
import {RoamingFallbackScreen} from "./fallback/roaming/roaming-fallback.component";
import {WifiFallbackScreen} from "./fallback/wifi/wifi-fallback.component";
import {HTTP} from "@ionic-native/http";

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
    LoadingPage,

    /* from src/learnplace */
    MapPage,
    TabsPage,
    ContentPage,

    TextBlock,
    PictureBlock,
    VideoBlock,
    LinkBlock,
    AccordionBlock,

    /* fallback screens */
    WifiFallbackScreen,
    LocationFallbackScreen,
    RoamingFallbackScreen,
    LeaveAppDialog,

    HardwareFeaturePage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    BrowserModule,
    BrowserAnimationsModule,

    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http): TranslateStaticLoader => new TranslateStaticLoader(http, "./assets/i18n", ".json"),
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
    //NewsPage,
    LoadingPage,

    /* from src/learnplace */
    MapPage,
    TabsPage,
    ContentPage,

    /* fallback screens */
    WifiFallbackScreen,

    /* fallback screens */
    LocationFallbackScreen,
    RoamingFallbackScreen,
    LeaveAppDialog,

    HardwareFeaturePage
  ],
  providers: [

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

    /* from  src/providers/ilias/news.rest*/
    {
      provide: NEWS_REST,
      useClass: NewsRestImpl
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

    /* from src/services/news/news.synchronization */
    {
      provide: NEWS_SYNCHRONIZATION,
      useClass: NewsSynchronizationImpl
    },

    /* from  src/providers/repository/repository.user*/
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeORMRepository
    },

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
    {
      provide: VISIT_JOURNAL_WATCH,
      useClass: SynchronizedVisitJournalWatch
    },

    /* Link service */
    {
      provide: INSTALLATION_LINK_PROVIDER,
      useClass: InstallationLinkSupplierImpl
    },
    {
      provide: TOKEN_SUPPLIER,
      useClass: AuthTokenSupplier
    },
    <FactoryProvider>{
      provide: DEFAULT_LINK_BUILDER,
      useFactory: (
        installationLink: InstallationLinkSupplier,
        tokenSupplier: TokenSupplier,
        userRepository: UserRepository
      ): () => DefaultLinkBuilder => {
        return (): DefaultLinkBuilder => new DefaultLinkBuilderImpl(installationLink, tokenSupplier, userRepository);
      },
      deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
    },
    <FactoryProvider>{
      provide: NEWS_LINK_BUILDER,
      useFactory: (
        installationLink: InstallationLinkSupplier,
        tokenSupplier: TokenSupplier,
        userRepository: UserRepository
      ): () => NewsLinkBuilder => {
        return (): NewsLinkBuilder => new NewsLinkBuilderImpl(installationLink, tokenSupplier, userRepository);
      },
      deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
    },
    <FactoryProvider>{
      provide: LOADING_LINK_BUILDER,
      useFactory: (installationLink: InstallationLinkSupplier): () => LoadingLinkBuilder => {
        return (): LoadingLinkBuilder => new LoadingLinkBuilderImpl(installationLink);
      },
      deps: [INSTALLATION_LINK_PROVIDER]
    },
    <FactoryProvider>{
      provide: LOGIN_LINK_BUILDER,
      useFactory: (): () => LoginLinkBuilder => {
        return (): LoginLinkBuilder => new LoginLinkBuilderImpl();
      },
      deps: []
    },
    <FactoryProvider>{
      provide: RESOURCE_LINK_BUILDER,
      useFactory: (
        installationLink: InstallationLinkSupplier,
        tokenSupplier: TokenSupplier,
        userRepository: UserRepository
      ): () => ResourceLinkBuilder => {
        return (): ResourceLinkBuilder => new ResourceLinkBuilderImpl(installationLink, tokenSupplier, userRepository);
      },
      deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
    },
    <FactoryProvider>{
      provide: TIMELINE_LINK_BUILDER,
      useFactory: (
        installationLink: InstallationLinkSupplier,
        tokenSupplier: TokenSupplier,
        userRepository: UserRepository
      ): () => TimelineLinkBuilder => {
        return (): TimelineLinkBuilder => new TimelineLinkBuilderImpl(installationLink, tokenSupplier, userRepository);
      },
      deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
    },
    {
      provide: LINK_BUILDER,
      useClass: LinkBuilderImpl
    },

    /* Actions */
    <FactoryProvider>{
      provide: OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY,
      useFactory: (browser: InAppBrowser, platform: Platform, modal: ModalController):
        (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction => {
        return (
            title: string,
            urlBuilder: Builder<Promise<string>>
        ): OpenObjectInILIASAction => new OpenObjectInILIASAction(title, urlBuilder, browser, platform, modal);
      },
      deps: [InAppBrowser, Platform, ModalController]
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
    AccordionMapper,
    VisitJournalMapper,

    {
      provide: RESOURCE_TRANSFER,
      useClass: HttpResourceTransfer
    },
      {
          provide: LEARNPLACE_PATH_BUILDER,
          useClass: LearnplacePathBuilderImpl
      },
      {
        provide: LEARNPLACE_MANAGER,
        useClass: LearnplaceManagerImpl
      },

    <FactoryProvider>{
      provide: OPEN_LEARNPLACE_ACTION_FACTORY,
      useFactory: (loader: LearnplaceLoader): OpenLearnplaceActionFunction =>
        (nav: NavController, learnplaceObjectId: number, learnplaceName: string, modalController: ModalController): OpenLearnplaceAction =>
          new OpenLearnplaceAction(loader, nav, learnplaceObjectId, learnplaceName, modalController)
      ,
      deps: [LEARNPLACE_LOADER]
    },
      <FactoryProvider>{
        provide: REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION,
          useFactory: (learnplaceManager: LearnplaceManager, translate: TranslateService): RemoveLocalLearnplaceActionFunction =>
              (title: string, objectId: number, userId: number): RemoveLocalLearnplaceAction =>
                  new RemoveLocalLearnplaceAction(learnplaceManager, translate, title, objectId, userId),
          deps: [LEARNPLACE_MANAGER, TranslateService]
      },

      // file transfer provider
      <ClassProvider> {
        provide: FILE_DOWNLOADER,
          useClass: FileDownloaderImpl
      },
      <ClassProvider> {
          provide: FILE_UPLOADER,
          useClass: FileUploaderImpl
      },

    ILIASRestProvider,
    FooterToolbarService,
    DataProvider,
    FileService,
    SynchronizationService,
    DataProviderFileObjectHandler,
    StatusBar,
    InAppBrowser,
    File,
    Network,
    SQLite,
    Toast,
    PegasusHttpClient,
    SplashScreen,
    Geolocation,
    PhotoViewer,
    StreamingMedia,
      HTTP,

    /* from src/services/device/hardware-features */
    Diagnostic,
    DiagnosticUtil,
    Hardware,

    IonicErrorHandler,
    {provide: ErrorHandler, useClass: PegasusErrorHandler},
      <ClassProvider>{provide: XhrFactory, useClass: PegasusXhrFactory, multi: false},
      <ClassProvider>{provide: MissingTranslationHandler, useClass: PegasusMissingTranslationHandler, multi: false}
  ],
  exports: [
    TranslateModule
  ]
})
export class AppModule {}
