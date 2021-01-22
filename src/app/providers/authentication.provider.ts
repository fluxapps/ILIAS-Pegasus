/** angular */
import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from "@ionic-native/in-app-browser/ngx";
import { NavController, ToastController } from "@ionic/angular";
/** misc */
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { ILIASInstallation } from "../config/ilias-config";
import { User } from "../models/user";
import { Logger } from "../services/logging/logging.api";
import { Logging } from "../services/logging/logging.service";

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

    private readonly log: Logger = Logging.getLogger("AuthenticationProvider");

    constructor(private readonly http: HttpClient,
                private readonly toast: ToastController,
                private readonly translate: TranslateService,
                private readonly browser: InAppBrowser,
                private readonly navCtrl: NavController,
                private readonly ngZone: NgZone,
                private readonly router: Router,
    ) {
    }

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
            this.user = await User.currentUser();
        } catch (e) {
            this.user = undefined;
        }
    }

    /**
     * logging in by creating new user, or updating existing user and navigating to the main page
     */
    async login(loginData: UserLoginData, navigate: boolean = true): Promise<void> {
        try {
            const user: User = await User.findByILIASUserId(loginData.iliasUserId, loginData.iliasInstallationId);
            user.accessToken = loginData.accessToken;
            user.iliasLogin = loginData.iliasLogin;
            user.refreshToken = loginData.refreshToken;
            user.lastTokenUpdate = Date.now();

            await user.save();
            AuthenticationProvider.user = user;
            if (navigate) await this.ngZone.run(() => this.navCtrl.navigateRoot("tabs"));
        } catch (error) {
            this.log.error(() => `User login failed, encountered error with message: "${error.message}"`);
            throw error;
        }
    }

    /**
     * logging out the user by resetting the authentication and navigating to the login-page
     */
    async logout(navigate: boolean = true): Promise<void> {
        AuthenticationProvider.user.accessToken = undefined;
        AuthenticationProvider.user.refreshToken = undefined;
        await AuthenticationProvider.user.save();

        AuthenticationProvider.user = undefined;

        if (navigate) await this.navCtrl.navigateRoot("login");

        await this.toast.create({
            message: this.translate.instant("logout.logged_out"),
            duration: 3000
        }).then((it: HTMLIonToastElement) => it.present());
    }

    /**
     * app-login via the login-page of ILIAS in a browser
     */
    async browserLogin(installation: ILIASInstallation): Promise<boolean> {
        const url: string = `${installation.url}/login.php?target=ilias_app_oauth2&client_id=${installation.clientId}`;
        const options: InAppBrowserOptions = {location: "no", clearsessioncache: "yes", clearcache: "yes"};
        const browser: InAppBrowserObject = this.browser.create(url, "_blank", options);
        return new Promise((resolve) => {
            const loadStopHandler: () => void = (): void => {
                // Fetch data from inAppBrowser
                browser.executeScript({code: 'document.getElementById("data").value'}).then((dataOut) => {
                    if (dataOut.length > 0) {
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
                            resolve(true);
                        }, (err) => {
                            console.error(this, err);
                            browser.close();
                            resolve(false);
                        });
                    } else {
                        resolve(false);
                    }
                });
            }

            browser.on("loadstop").subscribe(loadStopHandler);
        });
    }

    /**
     * called by the router as a guard
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (AuthenticationProvider.isLoggedIn()) {
            return true;
        }

        return this.router.createUrlTree(["/login"]);
    }
}
