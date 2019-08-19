/** angular */
import {Component, Inject} from "@angular/core";
import {Config, Platform, ToastController, ModalController, NavController} from "@ionic/angular";
/** ionic-native */
import {Network} from "@ionic-native/network/ngx";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {SQLite} from "@ionic-native/sqlite/ngx";
import {StatusBar} from "@ionic-native/status-bar/ngx";
import {AppVersion} from "@ionic-native/app-version/ngx";
/** services */
import {SQLiteDatabaseService} from "./services/database.service";
import {Database} from "./services/database/database";
import {FooterToolbarService, Job} from "./services/footer-toolbar.service";
import {Logger} from "./services/logging/logging.api";
import {Logging} from "./services/logging/logging.service";
import {DB_MIGRATION, DBMigration} from "./services/migration/migration.api";
import {SynchronizationService} from "./services/synchronization.service";
/** models */
import {Settings} from "./models/settings";
import {User} from "./models/user";
/** misc */
import getMessage = Logging.getMessage;
import {TranslateService} from "@ngx-translate/core";
import {PEGASUS_CONNECTION_NAME} from "./config/typeORM-config";
import {OnboardingPage} from "./pages/onboarding/onboarding";
import {Router} from "@angular/router";
import {AuthenticationProvider} from "./providers/authentification/authentication.provider";
import {ObjectListPage} from "./pages/object-list/object-list";

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
        @Inject(DB_MIGRATION) private readonly dbMigration: DBMigration,
        sqlite: SQLite
    ) {
        // Set members on classes which are not injectable
        Settings.NETWORK = this.network;
        SQLiteDatabaseService.SQLITE = sqlite;

        // init after platform is ready and native stuff is available
        this.platform.ready().then(() => {
            this.log.info(() => "Platform is ready");
            return this.initializeApp();
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
        this.statusBar.styleLightContent();
        this.defineBackButtonAction();

        await this.database.ready(PEGASUS_CONNECTION_NAME);
        await this.dbMigration.migrate();

        await this.manageLogin();

        // overwrite ionic back button text with configured language
        this.config.set("backButtonText", this.translate.instant("back"));

        this.splashScreen.hide();

        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
        if(this.user !== undefined) {
            const currentAppVersion: string = await this.appVersionPlugin.getVersionNumber();
            if(this.user.lastVersionLogin !== currentAppVersion) {
                await this.auth.logout();
                return;
            }
            const settings: Settings = await Settings.findByUserId(this.user.id);
            if (settings.downloadOnStart && window.navigator.onLine) await this.sync.loadAllOfflineContent();
        }
        this.footerToolbar.removeJob(Job.Synchronize);
    }

    /**
     * Configures the translation and, if needed, displays the onboarding-modal
     *
     * If no current user is found, the default translation will be loaded and the onboarding-modal will be presented
     */
    private async manageLogin(): Promise<void> {
        if(AuthenticationProvider.isLoggedIn()) {
            this.user = AuthenticationProvider.getUser();
            await this.configureTranslation(this.user);
            this.router.navigateByUrl("tabs");
        } else {
            this.configureDefaultTranslation();
            await this.presentOnboardingModal();
        }
    }

    /**
     * Configures the {@link TranslateService} depending on the given {@code user}.
     *
     * @param {User} user - the user to read its configured language
     */
    private async configureTranslation(user: User): Promise<void> {
        if(this.user !== undefined) {
            const setting: Settings = await Settings.findByUserId(user.id);
            this.translate.use(setting.language);
        } else {
            this.translate.use("de");
        }
        this.translate.setDefaultLang("de");
    }

    /**
     * Configures the {@link TranslateService} by the {@link navigator}.
     */
    private configureDefaultTranslation(): void {
        let userLang: string = navigator.language.split("-")[0];
        userLang = /(de|en)/gi.test(userLang) ? userLang : "de";

        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang("de");
        this.translate.use(userLang);
    }

    /**
     * displays the introduction-slides
     */
    async presentOnboardingModal(): Promise<void> {
        const onboardingModal: HTMLIonModalElement = await this.modal.create({
            component: OnboardingPage,
            cssClass: "modal-fullscreen"
        });
        await onboardingModal.present();
    }

    /**
     * Registers actions for the back button.
     */
    private defineBackButtonAction(): void {
        let backButtonTapped: boolean = false;

        this.platform.backButton.subscribeWithPriority(1, () => {
            const url: string = this.router.url;
            
            // default: router back-navigation
            let action: string = "back";

            // when on object-list-page, navigate back in the container-hierarchy
            if(url.match(/content/) && !url.match(/content\/0/) && !url.match(/details/)) {
                action = "back_in_hierarchy";
            }

            // when on one of the tabs default pages, navigate to the desktop-page
            if(
                url.match(/content\/0/) ||
                url.match(/content$/) ||
                url.match(/news$/) ||
                url.match(/menu$/)
            ) {
                action = "to_home";
            }

            // when on the desktop-page, double-tap back-button for exit
            if(url.match(/home$/)) {
                action = (backButtonTapped) ? "close" : "ask_close";
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

                default:
                case "back":
                    this.navCtrl.back();

            }
        });
    }
}
