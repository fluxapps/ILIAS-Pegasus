var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AppComponent } from "./app.component";
/** angular */
// TODO migration ionic-angular IonicApp, IonicErrorHandler
import { IonicModule, IonicRouteStrategy, Platform, ModalController } from "@ionic/angular";
import { RouteReuseStrategy } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HttpClient, XhrFactory } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
/** ionic-native */
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { File } from "@ionic-native/file/ngx";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Network } from "@ionic-native/network/ngx";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { SQLite } from "@ionic-native/sqlite/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { StreamingMedia } from "@ionic-native/streaming-media/ngx";
import { Toast } from "@ionic-native/toast/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
/** pages and screens */
//import {TestPage} from "./pages/test/test";
import { DesktopPage } from "./pages/desktop/desktop";
import { ObjectListPage } from "./pages/object-list/object-list";
import { LoginPage } from "./pages/login/login";
import { ModalPage } from "./pages/modal/modal";
import { NewObjectsPage } from "./pages/new-objects/new-objects";
import { ObjectDetailsPage } from "./pages/object-details/object-details";
import { OnboardingPage } from "./pages/onboarding/onboarding";
import { SettingsPage } from "./pages/settings/settings";
import { SyncFinishedModal } from "./pages/sync-finished-modal/sync-finished-modal";
import { TabmenuPage } from "./pages/tabmenu/tabmenu";
import { HardwareFeaturePage } from "./pages/test-hardware-feature/test-hardware-feature";
import { SynchronizationPage } from "./fallback/synchronization/synchronization.component";
import { NewsPage } from "./pages/news/news";
import { MenuPage } from "./pages/menu/menu";
//import {LoadingPage} from "./fallback/loading/loading.component";
//import {LocationFallbackScreen} from "./fallback/location/location-fallback.component";
import { LeaveAppDialog } from "./fallback/open-browser/leave-app.dialog";
import { Database } from "./services/database/database";
import { DATABASE_CONFIGURATION_ADAPTER, DatabaseConnectionRegistry } from "./services/database/database.api";
import { DiagnosticUtil } from "./services/device/hardware-features/diagnostics.util";
import { Hardware } from "./services/device/hardware-features/hardware-feature.service";
import { FileService } from "./services/file.service";
import { FooterToolbarService } from "./services/footer-toolbar.service";
//import {PegasusMissingTranslationHandler} from "./services/language/translation-missing-handler";
import { DEFAULT_LINK_BUILDER, DefaultLinkBuilderImpl } from "./services/link/default.builder";
import { LINK_BUILDER, LinkBuilderImpl } from "./services/link/link-builder.service";
import { LOADING_LINK_BUILDER, LoadingLinkBuilderImpl } from "./services/link/loading.builder";
import { LOGIN_LINK_BUILDER, LoginLinkBuilderImpl } from "./services/link/login.builder";
import { NEWS_LINK_BUILDER, NewsLinkBuilderImpl } from "./services/link/news.builder";
import { RESOURCE_LINK_BUILDER, ResourceLinkBuilderImpl } from "./services/link/resource.builder";
import { TIMELINE_LINK_BUILDER, TimelineLinkBuilderImpl } from "./services/link/timeline.builder";
import { DB_MIGRATION, MIGRATION_SUPPLIER } from "./services/migration/migration.api";
import { SimpleMigrationSupplier, TypeOrmDbMigration } from "./services/migration/migration.service";
import { NEWS_SYNCHRONIZATION, NewsSynchronizationImpl } from "./services/news/news.synchronization";
import { SynchronizationService } from "./services/synchronization.service";
import { AuthTokenSupplier, INSTALLATION_LINK_PROVIDER, InstallationLinkSupplierImpl, TOKEN_SUPPLIER } from "./services/link/link-builder.supplier";
/** providers */
import { NavProvider } from "./providers/nav.provider";
import { DataProvider } from "./providers/data-provider.provider";
import { ExecuteSyncProvider } from "./providers/execute-sync/execute-sync";
import { FILE_DOWNLOADER, FileDownloaderImpl } from "./providers/file-transfer/file-download";
import { FILE_UPLOADER, FileUploaderImpl } from "./providers/file-transfer/file-upload";
import { DataProviderFileObjectHandler } from "./providers/handlers/file-object-handler";
import { HttpClient as PegasusHttpClient, PegasusXhrFactory } from "./providers/http";
import { ILIASRestProvider } from "./providers/ilias-rest.provider";
import { ILIAS_REST, ILIASRestImpl, ILIASTokenManager, TOKEN_MANAGER } from "./providers/ilias/ilias.rest";
import { OAUTH2_DATA_SUPPLIER, TOKEN_RESPONSE_CONSUMER } from "./providers/ilias/ilias.rest-api";
import { NEWS_REST, NewsRestImpl } from "./providers/ilias/news.rest";
import { LogoutProvider } from "./providers/logout/logout";
import { USER_REPOSITORY, UserTypeORMRepository } from "./providers/repository/repository.user";
/** configs */
import { CONFIG_PROVIDER, ILIASConfigProvider } from "./config/ilias-config";
import { Oauth2DataSupplierImpl, TokenResponseConsumerImpl } from "./config/ilias.rest-config";
import { TypeORMConfigurationAdapter } from "./config/typeORM-config";
/** learnplaces */
/*
// pages for learnplaces
import {ContentPage} from "../learnplace/pages/content/content.component";
import {MapPage} from "../learnplace/pages/map/map.component";
import {TabsPage} from "../learnplace/pages/tabs/tabs.component";
// services for learnplaces
import {BLOCK_SERVICE, VisibilityManagedBlockService} from "../learnplace/services/block.service";
import {LEARNPLACE_MANAGER, LearnplaceManager, LearnplaceManagerImpl} from "../learnplace/services/learnplace.management";
import {LEARNPLACE_LOADER, LearnplaceLoader, RestLearnplaceLoader} from "../learnplace/services/loader/learnplace";
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
import {
    AccordionMapper,
    LinkBlockMapper,
    PictureBlockMapper,
    TextBlockMapper,
    VideoBlockMapper,
    VisitJournalMapper
} from "../learnplace/services/loader/mappers";
// providers for learnplaces
import {LEARNPLACE_REPOSITORY, TypeORMLearnplaceRepository} from "../learnplace/providers/repository/learnplace.repository";
import {MAP_REPOSITORY, TypeORMMapRepository} from "../learnplace/providers/repository/map.repository";
import {TypeORMVisitJournalRepository, VISIT_JOURNAL_REPOSITORY} from "../learnplace/providers/repository/visitjournal.repository";
import {ILIASLearnplaceAPI, LEARNPLACE_API} from "../learnplace/providers/rest/learnplace.api";
// actions for learnplaces
import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceAction, OpenLearnplaceActionFunction} from "../actions/open-learnplace-action";
import {
    REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION,
    RemoveLocalLearnplaceAction,
    RemoveLocalLearnplaceActionFunction
} from "../actions/remove-local-learnplace-action";
// directives for learnplaces
import {AccordionBlock} from "../learnplace/directives/accordion/accordion.directive";
import {LinkBlock} from "../learnplace/directives/linkblock/link-block.directive";
import {PictureBlock} from "../learnplace/directives/pictureblock/pictureblock.directive";
import {TextBlock} from "../learnplace/directives/textblock/textblock.directive";
import {VideoBlock} from "../learnplace/directives/videoblock/videoblock.directive";
*/
/** misc */
import { PegasusErrorHandler } from "./error-handler";
import { FileSizePipe } from "./pipes/fileSize.pipe";
import { AppRoutingModule } from "./app-routing.module";
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction } from "./actions/open-object-in-ilias-action";
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                AppComponent,
                //TestPage,
                DesktopPage,
                ObjectListPage,
                TabmenuPage,
                NewObjectsPage,
                SettingsPage,
                NewsPage,
                MenuPage,
                ObjectDetailsPage,
                LoginPage,
                SynchronizationPage,
                FileSizePipe,
                SyncFinishedModal,
                ModalPage,
                //LoadingPage,
                OnboardingPage,
                // from src/learnplace
                //MapPage,
                //TabsPage,
                //ContentPage,
                //TextBlock,
                //PictureBlock,
                //VideoBlock,
                //LinkBlock,
                //AccordionBlock,
                // fallback screens
                //WifiFallbackScreen,
                //LocationFallbackScreen,
                //RoamingFallbackScreen,
                LeaveAppDialog,
                HardwareFeaturePage
            ],
            entryComponents: [
                DesktopPage,
                ObjectListPage,
                TabmenuPage,
                NewObjectsPage,
                SettingsPage,
                NewsPage,
                ObjectDetailsPage,
                LoginPage,
                SynchronizationPage,
                SyncFinishedModal,
                //LoadingPage,
                OnboardingPage,
                // from src/learnplace
                //MapPage,
                //TabsPage,
                //ContentPage,
                // fallback screens
                //WifiFallbackScreen,
                // fallback screens
                //LocationFallbackScreen,
                //RoamingFallbackScreen,
                LeaveAppDialog,
                HardwareFeaturePage,
            ],
            imports: [
                HttpModule,
                HttpClientModule,
                BrowserModule,
                FormsModule,
                IonicModule.forRoot(),
                AppRoutingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: function (http) { return new TranslateHttpLoader(http, "./assets/i18n/", ".json"); },
                        deps: [HttpClient]
                    }
                }),
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
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
                // from  src/providers/ilias/news.rest
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
                // from  src/providers/repository/repository.user
                {
                    provide: USER_REPOSITORY,
                    useClass: UserTypeORMRepository
                },
                // from src/learnplace
                /*{
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
                },*/
                // Link service
                {
                    provide: INSTALLATION_LINK_PROVIDER,
                    useClass: InstallationLinkSupplierImpl
                },
                {
                    provide: TOKEN_SUPPLIER,
                    useClass: AuthTokenSupplier
                },
                {
                    provide: DEFAULT_LINK_BUILDER,
                    useFactory: function (installationLink, tokenSupplier, userRepository) {
                        return function () { return new DefaultLinkBuilderImpl(installationLink, tokenSupplier, userRepository); };
                    },
                    deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
                },
                {
                    provide: NEWS_LINK_BUILDER,
                    useFactory: function (installationLink, tokenSupplier, userRepository) {
                        return function () { return new NewsLinkBuilderImpl(installationLink, tokenSupplier, userRepository); };
                    },
                    deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
                },
                {
                    provide: LOADING_LINK_BUILDER,
                    useFactory: function (installationLink) {
                        return function () { return new LoadingLinkBuilderImpl(installationLink); };
                    },
                    deps: [INSTALLATION_LINK_PROVIDER]
                },
                {
                    provide: LOGIN_LINK_BUILDER,
                    useFactory: function () {
                        return function () { return new LoginLinkBuilderImpl(); };
                    },
                    deps: []
                },
                {
                    provide: RESOURCE_LINK_BUILDER,
                    useFactory: function (installationLink, tokenSupplier, userRepository) {
                        return function () { return new ResourceLinkBuilderImpl(installationLink, tokenSupplier, userRepository); };
                    },
                    deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
                },
                {
                    provide: TIMELINE_LINK_BUILDER,
                    useFactory: function (installationLink, tokenSupplier, userRepository) {
                        return function () { return new TimelineLinkBuilderImpl(installationLink, tokenSupplier, userRepository); };
                    },
                    deps: [INSTALLATION_LINK_PROVIDER, TOKEN_SUPPLIER, USER_REPOSITORY]
                },
                {
                    provide: LINK_BUILDER,
                    useClass: LinkBuilderImpl
                },
                // Actions
                {
                    provide: OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY,
                    useFactory: function (browser, platform, modal) {
                        return function (title, urlBuilder) { return new OpenObjectInILIASAction(title, urlBuilder, browser, platform, modal); };
                    },
                    deps: [InAppBrowser, Platform, ModalController]
                },
                // file transfer provider
                {
                    provide: FILE_DOWNLOADER,
                    useClass: FileDownloaderImpl
                },
                {
                    provide: FILE_UPLOADER,
                    useClass: FileUploaderImpl
                },
                ILIASRestProvider,
                FooterToolbarService,
                NavProvider,
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
                // from src/services/device/hardware-features
                Diagnostic,
                DiagnosticUtil,
                Hardware,
                //IonicErrorHandler,
                { provide: ErrorHandler, useClass: PegasusErrorHandler },
                { provide: XhrFactory, useClass: PegasusXhrFactory, multi: false },
                //<ClassProvider>{provide: MissingTranslationHandler, useClass: PegasusMissingTranslationHandler, multi: false},
                LogoutProvider,
                ExecuteSyncProvider,
                AppVersion
            ],
            exports: [
                TranslateModule
            ],
            bootstrap: [AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map