import {Component, Inject, NgZone} from "@angular/core";
import {AppVersion} from "@ionic-native/app-version/ngx";
import {InAppBrowserObject} from "@ionic-native/in-app-browser/ngx";
import {AlertController, Events, ModalController, NavController, Platform} from "@ionic/angular";
import {CONFIG_PROVIDER, ILIASConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {Settings} from "../../models/settings";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {SynchronizationService} from "../../services/synchronization.service";
import {TranslateService} from "@ngx-translate/core";
import {ThemeProvider} from "../../providers/theme/theme.provider";
import {LoadingPage} from "../../fallback/loading/loading.component";

@Component({
    templateUrl: "login.html"
})
export class LoginPage {

    readonly installations: Array<ILIASInstallation> = [];

    /**
     * Selected installation id
     */
    installationId: number;
    readonly appVersionStr: Promise<string>;

    constructor(private readonly platform: Platform,
                private readonly sync: SynchronizationService,
                @Inject(CONFIG_PROVIDER) private readonly configProvider: ILIASConfigProvider,
                private readonly event: Events,
                private readonly appVersionPlugin: AppVersion,
                private readonly auth: AuthenticationProvider,
                private readonly alertCtr: AlertController,
                private readonly translate: TranslateService,
                private readonly themeProvider: ThemeProvider,
                private readonly modal: ModalController,
                private readonly navCtrl: NavController,
                private readonly ngZone: NgZone
    ) {
      this.configProvider.loadConfig().then(config => {
          this.installations.push(...config.installations);
          this.installationId = this.installations[0].id;
      });

      this.appVersionStr = this.appVersionPlugin.getVersionNumber();
    }

    ionViewWillEnter(): void {
        ThemeProvider.setDefaultColor();
    }

    login(): void {
        if(!this.checkOnline()) return;
        const installation: ILIASInstallation = this.getSelectedInstallation();
        const browser: InAppBrowserObject = this.auth.browserLogin(installation);
        const loadingPage: Promise<HTMLIonModalElement> = this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen",
            backdropDismiss: false,
        });

        browser.on("exit").subscribe(() => {
            if(AuthenticationProvider.isLoggedIn()) {
                loadingPage.then(modal => {
                    modal.present()
                        .then(() => this.loginSequence())
                        .then(() => this.ngZone.run(() => this.navCtrl.navigateRoot("tabs")))
                        .finally(() => modal.dismiss());
                })
            }
        });
    }

    /**
     * the sequence of tasks that is performed after a successful login
     */
    private async loginSequence(): Promise<void> {
        await this.updateLastVersionLogin();
        await this.themeProvider.synchronizeAndSetCustomTheme();
        await this.checkAndLoadOfflineContent();
        await this.sync.resetOfflineSynchronization(true);
    }

    /**
     * if the device is offline, inform the user with an alert and return false
     */
    private checkOnline(): boolean {
        if(!window.navigator.onLine) {
            this.alertCtr.create({
                header: this.translate.instant("offline_title"),
                message: this.translate.instant("offline_content"),
                buttons: [{text: "Ok"}]
            }).then((alert: HTMLIonAlertElement) => alert.present());
            return false;
        }
        return true;
    }

    /**
     * update the value lastVersionLogin for the user after login
     */
    private async updateLastVersionLogin(): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        user.lastVersionLogin = await this.appVersionStr;
        await user.save();
    }

    /**
     * if downloadOnStart is enabled, synchronize all offline-data after login
     */
    private async checkAndLoadOfflineContent(): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        const settings: Settings = await Settings.findByUserId(user.id);
        if (settings.downloadOnStart && window.navigator.onLine) this.sync.loadAllOfflineContent();
    }

    /**
     * @returns {ILIASInstallation}
     */
    protected getSelectedInstallation(): ILIASInstallation {
        return this.installations.filter(installation => {
            return (installation.id == this.installationId);
        })[0];
    }

}
