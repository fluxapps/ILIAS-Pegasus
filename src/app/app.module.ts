import { HttpClient, HttpClientModule, XhrFactory } from "@angular/common/http";
import { ClassProvider, ErrorHandler, FactoryProvider, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouteReuseStrategy } from "@angular/router";
import { AppVersion } from "@ionic-native/app-version/ngx";
/** ionic-native */
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { File } from "@ionic-native/file/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Network } from "@ionic-native/network/ngx";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { SQLite } from "@ionic-native/sqlite/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { UniqueDeviceID } from "@ionic-native/unique-device-id/ngx";
import { Zip } from "@ionic-native/zip/ngx";
/** angular */
import { IonicModule, IonicRouteStrategy, ModalController, NavController, Platform } from "@ionic/angular";
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction } from "./actions/open-object-in-ilias-action";
import { INIT_APP } from "./app-initialisation";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { IlObjIconComponent } from "./components/icon/il-obj-icon.component";
/** configs */
import { CONFIG_PROVIDER, ILIASConfigProvider } from "./config/ilias-config";
import { Oauth2DataSupplierImpl, TokenResponseConsumerImpl } from "./config/ilias.rest-config";
import { TypeORMConfigurationAdapter } from "./config/typeORM-config";
/** misc */
import { PegasusErrorHandler } from "./error-handler";
// below: unused pages
import { LoadingPage } from "./fallback/loading/loading.component";
import { LocationFallbackScreen } from "./fallback/location/location-fallback.component";
/** pages and screens */
// import {OnboardingPage} from "./pages/onboarding/onboarding";
import { LeaveAppDialog } from "./fallback/open-browser/leave-app.dialog";
import { LeaveAppDialogService } from "./fallback/open-browser/leave-app.service";
import { RoamingFallbackScreen } from "./fallback/roaming/roaming-fallback.component";
import { WifiFallbackScreen } from "./fallback/wifi/wifi-fallback.component";
import {
    OPEN_HTML_LEARNING_MODULE_ACTION_FACTORY,
    OpenHtmlLearningModuleAction,
    OpenHtmlLearningModuleActionFunction
} from "./learningmodule/actions/open-html-learning-module-action";
import {
    OPEN_SCORM_LEARNING_MODULE_ACTION_FACTORY,
    OpenScormLearningModuleAction,
    OpenScormLearningModuleActionFunction
} from "./learningmodule/actions/open-scorm-learning-module-action";
/** learning modules */
import { LEARNING_MODULE_LOADER, RestLearningModuleLoader } from "./learningmodule/services/learning-module-loader";
import { LEARNING_MODULE_MANAGER, LearningModuleManager, LearningModuleManagerImpl } from "./learningmodule/services/learning-module-manager";
import {
    LEARNING_MODULE_PATH_BUILDER,
    LearningModulePathBuilder,
    LearningModulePathBuilderImpl
} from "./learningmodule/services/learning-module-path-builder";
// actions for learnplaces
import { OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceAction, OpenLearnplaceActionFunction } from "./learnplace/actions/open-learnplace-action";
import {
    REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION,
    RemoveLocalLearnplaceAction,
    RemoveLocalLearnplaceActionFunction
} from "./learnplace/actions/remove-local-learnplace-action";
// providers for learnplaces
import { LEARNPLACE_REPOSITORY, TypeORMLearnplaceRepository } from "./learnplace/providers/repository/learnplace.repository";
import { MAP_REPOSITORY, TypeORMMapRepository } from "./learnplace/providers/repository/map.repository";
import { TypeORMVisitJournalRepository, VISIT_JOURNAL_REPOSITORY } from "./learnplace/providers/repository/visitjournal.repository";
import { ILIASLearnplaceAPI, LEARNPLACE_API } from "./learnplace/providers/rest/learnplace.api";
/** learnplaces */
// services for learnplaces
import { LEARNPLACE_MANAGER, LearnplaceManager, LearnplaceManagerImpl } from "./learnplace/services/learnplace.management";
import { LEARNPLACE_LOADER, RestLearnplaceLoader } from "./learnplace/services/loader/learnplace";
import {
    AccordionMapper,
    LinkBlockMapper,
    PictureBlockMapper,
    TextBlockMapper,
    VideoBlockMapper,
    VisitJournalMapper
} from "./learnplace/services/loader/mappers";
import { HttpResourceTransfer, LEARNPLACE_PATH_BUILDER, LearnplacePathBuilderImpl, RESOURCE_TRANSFER } from "./learnplace/services/loader/resource";
import { MAP_SERVICE, VisibilityManagedMapService } from "./learnplace/services/map.service";
import { VisibilityStrategyApplier } from "./learnplace/services/visibility/visibility.context";
import { AfterVisitPlaceStrategy, AlwaysStrategy, NeverStrategy, OnlyAtPlaceStrategy } from "./learnplace/services/visibility/visibility.strategy";
import {
    SynchronizedVisitJournalWatch,
    VISIT_JOURNAL_SYNCHRONIZATION,
    VISIT_JOURNAL_WATCH,
    VisitJournalSynchronizationImpl
} from "./learnplace/services/visitjournal.service";
import { OnboardingPageModule } from "./pages/onboarding/onboarding.module";
import { HardwareFeaturePage } from "./pages/test-hardware-feature/test-hardware-feature";
import { AuthenticationProvider } from "./providers/authentication.provider";
/** providers */
import { DataProvider } from "./providers/data-provider.provider";
import { FILE_DOWNLOADER, FileDownloaderImpl } from "./providers/file-transfer/file-download";
import { FILE_UPLOADER, FileUploaderImpl } from "./providers/file-transfer/file-upload";
import { HttpClient as PegasusHttpClient, PegasusXhrFactory } from "./providers/http";
import { ILIASRestProvider } from "./providers/ilias-rest.provider";
import { ILIAS_REST, ILIASRestImpl, ILIASTokenManager, TOKEN_MANAGER } from "./providers/ilias/ilias.rest";
import { OAUTH2_DATA_SUPPLIER, TOKEN_RESPONSE_CONSUMER } from "./providers/ilias/ilias.rest-api";
import { NEWS_REST, NewsRestImpl } from "./providers/ilias/news.rest";
import { USER_REPOSITORY, UserRepository, UserTypeORMRepository } from "./providers/repository/repository.user";
import { IconProvider } from "./providers/theme/icon.provider";
//import {SyncFinishedModal} from "./pages/sync-finished-modal/sync-finished-modal";
//import {TestPage} from "./pages/test/test";
/** services */
import { Builder } from "./services/builder.base";
import { Database } from "./services/database/database";
import { DATABASE_CONFIGURATION_ADAPTER, DatabaseConnectionRegistry } from "./services/database/database.api";
import { GeolocationModule } from "./services/device/geolocation/geolocation.module";
import { DiagnosticUtil } from "./services/device/hardware-features/diagnostics.util";
import { Hardware } from "./services/device/hardware-features/hardware-feature.service";
import { FileService } from "./services/file.service";
import { FilesystemModule } from "./services/filesystem/filesystem.module";
import { UserStorageService } from "./services/filesystem/user-storage.service";
import { FooterToolbarService } from "./services/footer-toolbar.service";
import { PegasusMissingTranslationHandler } from "./services/language/translation-missing-handler";
import { DEFAULT_LINK_BUILDER, DefaultLinkBuilder, DefaultLinkBuilderImpl } from "./services/link/default.builder";
import { LINK_BUILDER, LinkBuilderImpl } from "./services/link/link-builder.service";
import {
    AuthTokenSupplier,
    INSTALLATION_LINK_PROVIDER,
    InstallationLinkSupplier,
    InstallationLinkSupplierImpl,
    TOKEN_SUPPLIER,
    TokenSupplier
} from "./services/link/link-builder.supplier";
import { LOADING_LINK_BUILDER, LoadingLinkBuilder, LoadingLinkBuilderImpl } from "./services/link/loading.builder";
import { LOGIN_LINK_BUILDER, LoginLinkBuilder, LoginLinkBuilderImpl } from "./services/link/login.builder";
import { NEWS_LINK_BUILDER, NewsLinkBuilder, NewsLinkBuilderImpl } from "./services/link/news.builder";
import { RESOURCE_LINK_BUILDER, ResourceLinkBuilder, ResourceLinkBuilderImpl } from "./services/link/resource.builder";
import { TIMELINE_LINK_BUILDER, TimelineLinkBuilder, TimelineLinkBuilderImpl } from "./services/link/timeline.builder";
import { DB_MIGRATION, MIGRATION_SUPPLIER } from "./services/migration/migration.api";
import { SimpleMigrationSupplier, TypeOrmDbMigration } from "./services/migration/migration.service";
import { NEWS_FEED, NewsFeedImpl } from "./services/news/news.feed";
import { NEWS_SYNCHRONIZATION, NewsSynchronizationImpl } from "./services/news/news.synchronization";
import { SynchronizationService } from "./services/synchronization.service";
import { CssStyleService } from "./services/theme/css-style.service";

@NgModule({
    declarations: [
        AppComponent,
        //ModalPage,
        // OnboardingPage,
        LeaveAppDialog,
        //TestPage,
        LoadingPage,
        //SyncFinishedModal,
        // fallback screens
        WifiFallbackScreen,
        LocationFallbackScreen,
        RoamingFallbackScreen,

        HardwareFeaturePage
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        GeolocationModule,
        FilesystemModule,
        OnboardingPageModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, "./assets/i18n/", ".json"),
                deps: [HttpClient]
            }
        }),
    ],
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},

        // Application initializer
        INIT_APP,

        // from src/config/ilias-config
        {
            provide: CONFIG_PROVIDER,
            useClass: ILIASConfigProvider
        },

        // from src/providers/ilias/lias.rest
        {
            provide: TOKEN_MANAGER,
            useClass: ILIASTokenManager
        },
        {
            provide: ILIAS_REST,
            useClass: ILIASRestImpl
        },

        // from src/providers/ilias/news.rest
        {
            provide: NEWS_REST,
            useClass: NewsRestImpl
        },

        // from src/config/ilias.rest-config
        {
            provide: OAUTH2_DATA_SUPPLIER,
            useClass: Oauth2DataSupplierImpl
        },
        {
            provide: TOKEN_RESPONSE_CONSUMER,
            useClass: TokenResponseConsumerImpl
        },

        // from src/services/migration/migration.service
        // from src/services/migration/migration.api
        {
            provide: DB_MIGRATION,
            useClass: TypeOrmDbMigration
        },

        {
            provide: MIGRATION_SUPPLIER,
            useClass: SimpleMigrationSupplier
        },

        // from src/services/database.service
        {
            provide: DATABASE_CONFIGURATION_ADAPTER,
            useClass: TypeORMConfigurationAdapter
        },
        DatabaseConnectionRegistry,
        Database,

        // from src/services/news/news.synchronization
        {
            provide: NEWS_SYNCHRONIZATION,
            useClass: NewsSynchronizationImpl
        },

        // from src/providers/ilias/news.feed
        {
            provide: NEWS_FEED,
            useClass: NewsFeedImpl
        },

        // from  src/providers/repository/repository.user
        {
            provide: USER_REPOSITORY,
            useClass: UserTypeORMRepository
        },

        // from src/learnplace
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
        //{
        //    provide: BLOCK_SERVICE,
        //    useClass: VisibilityManagedBlockService
        //},
        {
            provide: VISIT_JOURNAL_WATCH,
            useClass: SynchronizedVisitJournalWatch
        },

        {
            provide: LEARNING_MODULE_LOADER,
            useClass: RestLearningModuleLoader
        },

        // Link service
        {
            provide: INSTALLATION_LINK_PROVIDER,
            useClass: InstallationLinkSupplierImpl
        },
        {
            provide: TOKEN_SUPPLIER,
            useClass: AuthTokenSupplier
        },
        <FactoryProvider> {
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
        <FactoryProvider> {
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
        <FactoryProvider> {
            provide: LOADING_LINK_BUILDER,
            useFactory: (installationLink: InstallationLinkSupplier): () => LoadingLinkBuilder => {
                return (): LoadingLinkBuilder => new LoadingLinkBuilderImpl(installationLink);
            },
            deps: [INSTALLATION_LINK_PROVIDER]
        },
        <FactoryProvider> {
            provide: LOGIN_LINK_BUILDER,
            useFactory: (): () => LoginLinkBuilder => {
                return (): LoginLinkBuilder => new LoginLinkBuilderImpl();
            },
            deps: []
        },
        <FactoryProvider> {
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
        <FactoryProvider> {
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

        // Actions
        <FactoryProvider> {
            provide: OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY,
            useFactory: (browser: InAppBrowser, platform: Platform, modal: ModalController, safariViewController: SafariViewController):
                (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction => {
                return (
                    title: string,
                    urlBuilder: Builder<Promise<string>>
                ): OpenObjectInILIASAction => new OpenObjectInILIASAction(title, urlBuilder, browser, platform, modal, safariViewController);
            },
            deps: [InAppBrowser, Platform, ModalController, SafariViewController]
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

        <FactoryProvider> {
            provide: OPEN_LEARNPLACE_ACTION_FACTORY,
            useFactory: (manager: LearnplaceManager, userRepository: UserRepository): OpenLearnplaceActionFunction =>
                (nav: NavController, learnplaceObjectId: number, learnplaceName: string, modalController: ModalController): OpenLearnplaceAction =>
                    new OpenLearnplaceAction(manager, nav, learnplaceObjectId, learnplaceName, modalController, userRepository)
            ,
            deps: [LEARNPLACE_MANAGER, USER_REPOSITORY]
        },
        <FactoryProvider> {
            provide: OPEN_HTML_LEARNING_MODULE_ACTION_FACTORY,
            useFactory: (
                browser: InAppBrowser,
                modalController: ModalController,
                manager: LearningModuleManager,
                leaveAppService: LeaveAppDialogService
            ): OpenHtmlLearningModuleActionFunction =>
                (
                    nav: NavController,
                    learningModuleObjectId: number,
                    pathBuilder: LearningModulePathBuilder,
                    translate: TranslateService
                ):
                    OpenHtmlLearningModuleAction => new OpenHtmlLearningModuleAction(
                    nav,
                    learningModuleObjectId,
                    modalController,
                    browser,
                    translate,
                    pathBuilder,
                    manager,
                    leaveAppService
                )
            ,
            deps: [InAppBrowser, ModalController, LEARNING_MODULE_MANAGER, LeaveAppDialogService]
        },
        <FactoryProvider> {
            provide: OPEN_SCORM_LEARNING_MODULE_ACTION_FACTORY,
            useFactory: (
                manager: LearningModuleManager,
                modalController: ModalController,
                leaveAppDialogService: LeaveAppDialogService
            ): OpenScormLearningModuleActionFunction =>
                (
                    learningModuleObjectId: number,
                    navCtrl: NavController
                ):
                    OpenScormLearningModuleAction => new OpenScormLearningModuleAction(
                    learningModuleObjectId,
                    modalController,
                    navCtrl,
                    manager,
                    leaveAppDialogService
                )
            ,
            deps: [LEARNING_MODULE_MANAGER, ModalController, LeaveAppDialogService]
        },
        {
            provide: LEARNING_MODULE_PATH_BUILDER,
            useClass: LearningModulePathBuilderImpl
        },
        {
            provide: LEARNING_MODULE_MANAGER,
            useClass: LearningModuleManagerImpl
        },
        <FactoryProvider> {
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
        CssStyleService,
        FileService,
        SynchronizationService,
        StatusBar,
        InAppBrowser,
        File,
        Network,
        SQLite,
        PegasusHttpClient,
        SplashScreen,
        HTTP,
        WebView,
        UserStorageService,

        // from src/services/device/hardware-features
        Diagnostic,
        DiagnosticUtil,
        Hardware,

        {provide: ErrorHandler, useClass: PegasusErrorHandler},
        <ClassProvider>{provide: XhrFactory, useClass: PegasusXhrFactory, multi: false},
        <ClassProvider>{provide: MissingTranslationHandler, useClass: PegasusMissingTranslationHandler, multi: false},
        AuthenticationProvider,
        IconProvider,
        AppVersion,
        Zip,
        UniqueDeviceID,
        FileOpener,
        SafariViewController,
    ],
    exports: [
        TranslateModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
