/** angular */
import {Component, Inject} from "@angular/core";
import {Events, Platform} from "@ionic/angular";
/** ionic-native */
import {InAppBrowser, InAppBrowserObject, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";
import {Toast} from "@ionic-native/toast/ngx";
import {AppVersion} from "@ionic-native/app-version/ngx";
/** models */
import {User} from "../../models/user";
import {Settings} from "../../models/settings";
/** logging */
import {Log} from "../../services/log.service";
/** misc */
import {SynchronizationService} from "../../services/synchronization.service";
import {CONFIG_PROVIDER, ILIASConfigProvider, ILIASInstallation} from "../../config/ilias-config";


@Component({
    templateUrl: "login.html",
    providers: [Toast]
})
export class LoginPage {

    readonly installations: Array<ILIASInstallation> = [];

    /**
     * Selected installation id
     */
    installationId: number;
    readonly appVersionStr: Promise<string>;

    constructor(public platform: Platform,
                private readonly sync: SynchronizationService,
                @Inject(CONFIG_PROVIDER) private readonly configProvider: ILIASConfigProvider,
                public toast: Toast,
                public event: Events,
                private readonly browser: InAppBrowser,
                readonly appVersionPlugin: AppVersion
    ) {
      this.configProvider.loadConfig().then(config => {
          this.installations.push(...config.installations);
          this.installationId = this.installations[0].id;
      });

      this.appVersionStr = this.appVersionPlugin.getVersionNumber();
    }

    login() {
        const installation: ILIASInstallation = this.getSelectedInstallation();
        const url: string = `${installation.url}/login.php?target=ilias_app_oauth2&client_id=${installation.clientId}`;
        const options: InAppBrowserOptions = {
          location: "no", clearsessioncache: "yes", clearcache: "yes"
        };
        const browser: InAppBrowserObject = this.browser.create(url, "_blank", options);
        Log.describe(this, "inappBrowser", browser);
        browser.on("loadstop").subscribe(() => {
            // Fetch data from inAppBrowser
            Log.write(this, "Loadstop registered.");
            browser.executeScript({code: 'document.getElementById("data").value'}).then( (encodedData) => {
                if (encodedData.length) {
                    Log.write(this, "Login successfull from script");
                    // Data is an array with the following chunks: iliasUserId, iliasLogin, accessToken, refreshToken
                    const data: any = encodedData[0].split("|||");
                    Log.describe(this, "Data received from OAuth", data);
                    this.saveUser(data[0], data[1], data[2], data[3]).then(() => {
                        Log.write(this, "User saved.");
                        browser.close();
                    }, (err) => {
                        Log.error(this, err);
                        browser.close();
                    });
                }
            });
        });

        browser.on("exit").subscribe(() => {
            Log.write(this, "exit browser.");
            this.checkLogin()
                .then(() => this.updateLastVersionLogin())
                .then(() => this.checkAndLoadOfflineContent());
        });

    }

    /**
     * Checks if an active user is found in the app and redirects to desktop.
     * If no active user is found, the login mechanism went wrong --> display same page again
     */
    protected checkLogin(): Promise<void> {
        console.log("[ [ checking login ] ]");
        return User.currentUser().then(() => {
            Log.write(this, "got user.");
            this.event.publish("login");
            console.log("yay!");
        }, () => {
            Log.write(this, "Login went wrong....");
            this.toast.showShortTop("Login failed");
            console.log("nay!");
        });
    }

    /**
     * update the value lastVersionLogin for the user after login
     */
    private async updateLastVersionLogin(): Promise<void> {
        const user: User = await User.currentUser();
        user.lastVersionLogin = await this.appVersionStr;
        await user.save();
    }

    /**
     * if downloadOnStart is enabled, synchronize all offline-data after login
     */
    private async checkAndLoadOfflineContent(): Promise<void> {
        const user: User = await User.currentUser();
        const settings: Settings = await Settings.findByUserId(user.id);
        if (settings.downloadOnStart && window.navigator.onLine) this.sync.loadAllOfflineContent();
    }


    /**
     * Create or update existing user
     * @param iliasUserId
     * @param iliasLogin
     * @param accessToken
     * @param refreshToken
     */
    protected saveUser(iliasUserId: number, iliasLogin: string, accessToken: string, refreshToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            User.findByILIASUserId(iliasUserId, this.installationId).then((user: User) => {
                Log.write(this, "found user with ilias id" + iliasUserId);
                Log.describe(this, "refreshtoken: ", refreshToken);
                user.accessToken = accessToken;
                user.iliasLogin = iliasLogin;
                user.refreshToken = refreshToken;
                user.lastTokenUpdate = Date.now();
                user.save().then(() => {
                    resolve();
                }, (err) => {
                    Log.error(this, err);
                    reject();
                });
            }, (err) => {
                reject(err);
            });
        });
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
