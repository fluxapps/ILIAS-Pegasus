/** angular */
import {Component, Inject, NgZone} from "@angular/core";
import {Config, Events, ModalController, NavController, Platform, ToastController} from "@ionic/angular";
import {Router} from "@angular/router";
/** ionic-native */
import {Network} from "@ionic-native/network/ngx";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {SQLite} from "@ionic-native/sqlite/ngx";
import {StatusBar} from "@ionic-native/status-bar/ngx";
import {AppVersion} from "@ionic-native/app-version/ngx";
/** services */
import {SQLiteDatabaseService} from "./services/database.service";
import {Database} from "./services/database/database";
import {FooterToolbarService} from "./services/footer-toolbar.service";
import {Logger} from "./services/logging/logging.api";
import {Logging} from "./services/logging/logging.service";
import {DB_MIGRATION, DBMigration} from "./services/migration/migration.api";
import {SynchronizationService} from "./services/synchronization.service";
/** models */
import {Settings} from "./models/settings";
import {User} from "./models/user";
import {TranslateService} from "@ngx-translate/core";
import {PEGASUS_CONNECTION_NAME} from "./config/typeORM-config";
import {OnboardingPage} from "./pages/onboarding/onboarding";
import {AuthenticationProvider} from "./providers/authentication.provider";
import {ObjectListPage} from "./pages/object-list/object-list";
import {ThemeProvider} from "./providers/theme/theme.provider";
/** misc */
import getMessage = Logging.getMessage;

@Component({
    selector: "app-root",
    templateUrl: "app.component.html"
})
export class AppComponent {
    /**
     * The current logged in user
     */
    private user: User;

    private readonly log: Logger = Logging.getLogger(AppComponent.name);

    /**
     * This constructor sets on classes which are not injectable yet
     * member instances. This is a workaround for Ionic 3 update with
     * the current app architecture. This will be changed on release 2.0.0.
     */
    constructor(
        readonly footerToolbar: FooterToolbarService,
        private readonly navCtrl: NavController,
        private readonly router: Router,
        private readonly events: Events,
        private readonly platform: Platform,
        private readonly translate: TranslateService,
        private readonly toast: ToastController,
        private readonly sync: SynchronizationService,
        private readonly statusBar: StatusBar,
        private readonly network: Network,
        private readonly splashScreen: SplashScreen,
        private readonly database: Database,
        private readonly modal: ModalController,
        private readonly config: Config,
        private readonly auth: AuthenticationProvider,
        private readonly appVersionPlugin: AppVersion,
        private readonly ngZone: NgZone,
        private readonly themeProvider: ThemeProvider,
        @Inject(DB_MIGRATION) private readonly dbMigration: DBMigration,
        sqlite: SQLite
    ) {
        // Set members on classes which are not injectable
        Settings.NETWORK = this.network;
        SQLiteDatabaseService.SQLITE = sqlite;

        // init after platform is ready and native stuff is available
        this.platform.ready().then(() => {
            this.initializeApp();
            this.log.info(() => "Platform is ready");
        }).catch((error) => {
            const message: string = getMessage(error,  `Error occurred: \n${JSON.stringify(error)}`);
            const errorType: string = (error instanceof Error) ? error.name : "N/a";
            this.log.warn(() => `Could not initialize app. Error type: ${errorType} Message: ${message}`)
        });
    }

    /**
     * Initialize everything that has to be done on start up.
     */
    private async initializeApp(): Promise<void> {
        this.log.info(() => "Initialize app");
        // database
        await this.database.ready(PEGASUS_CONNECTION_NAME);
        await this.dbMigration.migrate();

        // user and login-dependent features
        await AuthenticationProvider.loadUserFromDatabase();
        this.user = AuthenticationProvider.getUser();

        await this.configureTranslation();

        if(AuthenticationProvider.isLoggedIn()) {
            await this.sync.resetOfflineSynchronization(true);
            await this.themeProvider.loadResources();
            await this.navCtrl.navigateRoot("tabs");
        } else {
            await this.presentOnboardingModal();
        }

        // style and navigation
        this.statusBar.styleLightContent();
        this.initializeBackButton();

        if(AuthenticationProvider.isLoggedIn()) {
            const currentAppVersion: string = await this.appVersionPlugin.getVersionNumber();
            if(this.user.lastVersionLogin !== currentAppVersion) {
                await this.auth.logout();
                return;
            }

            const settings: Settings = await Settings.findByUserId(this.user.id);
            if(settings.downloadOnStart && window.navigator.onLine) this.sync.loadAllOfflineContent();
        }

        this.splashScreen.hide();
    }

    /**
     * Configures the {@link TranslateService} depending on the given
     */
    private async configureTranslation(): Promise<void> {
        if(AuthenticationProvider.isLoggedIn()) {
            const setting: Settings = await Settings.findByUserId(this.user.id);
            this.translate.use(setting.language);
        } else {
            // get the language of the navigator an check if it is supported. default is de
            let lng: string = "de";
            const navLng: string = navigator.language.split("-")[0];
            ["de", "en", "it"].forEach(s => {if(navLng.match(`/${s}/i`)) lng = s;});
            this.translate.use(lng);
        }
        this.translate.setDefaultLang("de");
    }

    /**
     * displays the introduction-slides
     */
    async presentOnboardingModal(): Promise<void> {
        await this.modal.create({
            component: OnboardingPage,
            cssClass: "modal-fullscreen",
        }).then((it: HTMLIonModalElement) => it.present());
    }

    /**
     * Registers actions for the back button.
     */
    private initializeBackButton(): void {
        let backButtonTapped: boolean = false;

        this.platform.backButton.subscribeWithPriority(0, () => {
            const url: string = this.router.url;

            // default: router back-navigation
            let action: string = "back";

            // when on object-list-page, navigate back in the container-hierarchy
            if(
                url.match(/(content|favorites)/) &&
                !url.match(/(content|favorites)\/0/) &&
                !url.match(/details/) &&
                !url.match(/learnplace/)
            ) {
                action = "back_in_hierarchy";
            }

            // when on one of the tabs default pages, navigate to the desktop-page
            if(
                url.match(/content\/0/) ||
                url.match(/favorites\/0/) ||
                url.match(/news$/) ||
                url.match(/menu\/main$/)
            ) {
                action = "to_home";
            }

            // when on the desktop-page, double-tap back-button for exit
            if(
                url.match(/home$/) ||
                url.match(/login$/)
            ) {
                action = (backButtonTapped) ? "close" : "ask_close";
            }

            if(
                url.match(/learnplace/)
            ) {
                action = "back_to_content";
            }

            switch(action) {
                case "to_home":
                    this.navCtrl.navigateRoot("tabs");
                    break;

                case "ask_close":
                    backButtonTapped = true;
                    setTimeout(() => {
                        backButtonTapped = false;
                    }, 3000);
                    this.toast.create({
                        message: this.translate.instant("message.back_to_exit"),
                        duration: 3000
                    }).then(function(it) { return it.present(); });
                    break;

                case "close":
                    navigator["app"].exitApp();
                    break;

                case "back_in_hierarchy":
                    ObjectListPage.navigateBackInHierarchy(this.navCtrl);
                    break;

                case "back_to_content":
                    ObjectListPage.navigateBackToObjectList(this.navCtrl);
                    break;

                default:
                case "back":
                    this.navCtrl.back();
            }
        });

        this.config.set("backButtonText", this.translate.instant("back"));
    }
}
