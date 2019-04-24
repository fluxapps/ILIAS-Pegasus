import {Component, Inject} from "@angular/core";
import {InAppBrowser, InAppBrowserObject, InAppBrowserOptions} from "@ionic-native/in-app-browser";
import {Toast} from "@ionic-native/toast";
import {Events, NavController, Platform} from "ionic-angular";
import {CONFIG_PROVIDER, ILIASConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {User} from "../../models/user";
import {ExecuteSyncProvider} from "../../providers/execute-sync/execute-sync";
import {Log} from "../../services/log.service";

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

    constructor(public platform: Platform,
                public nav: NavController,
                @Inject(CONFIG_PROVIDER) private readonly configProvider: ILIASConfigProvider,
                public toast: Toast,
                public event: Events,
                private readonly browser: InAppBrowser,
                private readonly executeSyncCtrl: ExecuteSyncProvider
    ) {
      this.configProvider.loadConfig().then(config => {
          this.installations.push(...config.installations);
          this.installationId = this.installations[0].id;
      });
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
                    const data = encodedData[0].split("|||");
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
            this.checkLogin();
        });
    }

    /**
     * Checks if an active user is found in the app and redirects to desktop.
     * If no active user is found, the login mechanism went wrong --> display same page again
     */
    protected checkLogin() {
        return User.currentUser().then(() => {
            Log.write(this, "got user.");
            this.event.publish("login");
        }, () => {
            Log.write(this, "Login went wrong....");
            this.toast.showShortTop("Login failed");
        });
    }


    /**
     * Create or update existing user
     * @param iliasUserId
     * @param iliasLogin
     * @param accessToken
     * @param refreshToken
     */
    protected saveUser(iliasUserId: number, iliasLogin: string, accessToken: string, refreshToken: string) {
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
