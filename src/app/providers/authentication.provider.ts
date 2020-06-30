/** angular */
import {HttpClient} from "@angular/common/http";
import {Injectable, NgZone} from "@angular/core";
import {CanActivate} from "@angular/router";
import {NavController, ToastController} from "@ionic/angular";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {User} from "../models/user";
import {Log} from "../services/log.service";
import {ILIASInstallation} from "../config/ilias-config";
import {InAppBrowser, InAppBrowserObject, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";

interface UserLoginData {
    iliasUserId: number,
    iliasInstallationId: number,
    iliasLogin: string,
    accessToken: string,
    refreshToken: string
}

@Injectable({
    providedIn: "root"
})
export class AuthenticationProvider implements CanActivate {
    private static user: User = undefined;

    constructor(private readonly http: HttpClient,
                private readonly toast: ToastController,
                private readonly translate: TranslateService,
                private readonly browser: InAppBrowser,
                private readonly navCtrl: NavController,
                private readonly ngZone: NgZone
    ) {}

    /**
     * returns the currently logged in user, or undefined
     */
    static getUser(): User {
        return AuthenticationProvider.user;
    }

    /**
     * to check wether a user is logged in
     */
    static isLoggedIn(): boolean {
        return AuthenticationProvider.user !== undefined;
    }

    /**
     * called on initialization of app, in order to set the user-field of this class
     */
    static async loadUserFromDatabase(): Promise<void> {
        try {
            await User.currentUser().then(user => this.user = user);
        } catch(e) {
            this.user = undefined;
        }
    }

    /**
     * logging in by creating new user, or updating existing user and navigating to the main page
     */
    async login(loginData: UserLoginData, navigate: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {
            User.findByILIASUserId(loginData.iliasUserId, loginData.iliasInstallationId).then((user: User) => {
                user.accessToken = loginData.accessToken;
                user.iliasLogin = loginData.iliasLogin;
                user.refreshToken = loginData.refreshToken;
                user.lastTokenUpdate = Date.now();

                user.save().then(() => {
                    AuthenticationProvider.user = user;
                    if(navigate) this.ngZone.run(() => this.navCtrl.navigateRoot("tabs"));
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
     * logging out the user by resetting the authentication and navigating to the login-page
     */
    async logout(navigate: boolean = true): Promise<void> {
        AuthenticationProvider.user.accessToken = undefined;
        AuthenticationProvider.user.refreshToken = undefined;
        await AuthenticationProvider.user.save();

        AuthenticationProvider.user = undefined;

        if(navigate) this.navCtrl.navigateRoot("login");

        await this.toast.create({
            message: this.translate.instant("logout.logged_out"),
            duration: 3000
        }).then((it: HTMLIonToastElement) => it.present());
    }

    /**
     * app-login via the login-page of ILIAS in a browser
     */
    browserLogin(installation: ILIASInstallation): InAppBrowserObject {
        const url: string = `${installation.url}/login.php?target=ilias_app_oauth2&client_id=${installation.clientId}`;
        const options: InAppBrowserOptions = {location: "no", clearsessioncache: "yes", clearcache: "yes"};
        const browser: InAppBrowserObject = this.browser.create(url, "_blank", options);

        browser.on("loadstop").subscribe(() => {
            // Fetch data from inAppBrowser
            browser.executeScript({code: 'document.getElementById("data").value'}).then( (dataOut) => {
                if (dataOut.length) {
                    dataOut = dataOut[0].split("|||");
                    const loginData: UserLoginData = {
                        iliasUserId: dataOut[0],
                        iliasInstallationId: installation.id,
                        iliasLogin: dataOut[1],
                        accessToken: dataOut[2],
                        refreshToken: dataOut[3]
                    };
                    this.login(loginData, false).then(() => {
                        browser.close();
                    }, (err) => {
                        console.error(this, err);
                        browser.close();
                    });
                }
            });
        });

        return browser;
    }

    /**
     * called by the router as a guard
     */
    canActivate(): boolean {
        if(AuthenticationProvider.isLoggedIn())
            return true;

        this.navCtrl.navigateRoot("login");
        return false;
    }
}
