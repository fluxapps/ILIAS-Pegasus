/** angular */
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AppVersion } from "@ionic-native/app-version/ngx";
/** ionic-native */
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { Config, ModalController, NavController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
/** models */
import { Settings } from "./models/settings";
import { User } from "./models/user";
import { ObjectListPage } from "./pages/object-list/object-list";
import { OnboardingPage } from "./pages/onboarding/onboarding";
import { AuthenticationProvider } from "./providers/authentication.provider";
import { ThemeProvider } from "./providers/theme/theme.provider";
import { Logger } from "./services/logging/logging.api";
import { Logging } from "./services/logging/logging.service";
import { SynchronizationService } from "./services/synchronization.service";
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
        private readonly router: Router,
        private readonly sync: SynchronizationService,
        private readonly splashScreen: SplashScreen,
        private readonly modal: ModalController,
        private readonly auth: AuthenticationProvider,
        private readonly appVersionPlugin: AppVersion,
        private readonly themeProvider: ThemeProvider,
        private readonly platform: Platform,
        private readonly navCtrl: NavController,
        private readonly toastCtrl: ToastController,
        private readonly config: Config,
        private readonly translate: TranslateService,
    ) {

        // init after platform is ready and native stuff is available
        this.initializeApp().then(() => {
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

        this.user = AuthenticationProvider.getUser();

        await this.initBackButton();

        if(AuthenticationProvider.isLoggedIn()) {
            await this.sync.resetOfflineSynchronization(true);
            await this.themeProvider.loadResources();
        } else {
            // Dont await modal
            await this.presentOnboardingModal();
        }

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
     * displays the introduction-slides
     */
    async presentOnboardingModal(): Promise<void> {
        const modal: HTMLIonModalElement = await this.modal.create({
            component: OnboardingPage,
            cssClass: "modal-fullscreen",
        });

        await modal.present();
    }

    private async initBackButton(): Promise<void> {
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
                    this.toastCtrl.create({
                        message: this.translate.instant("message.back_to_exit"),
                        duration: 3000
                    }).then((it: HTMLIonToastElement) => it.present());
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
