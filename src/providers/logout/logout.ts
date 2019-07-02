/** angular */
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {App, ToastController, Toast, ToastOptions} from "ionic-angular";
import {Page} from "ionic-angular/navigation/nav-util";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {User} from "../../models/user";
import {LoginPage} from "../../pages/login/login";

/*
  Generated class for the LogoutProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LogoutProvider {
  private user: User;

  loginPage: Page = LoginPage;
  loggedIn: boolean = false;

  constructor(public http: HttpClient,
              private readonly toast: ToastController,
              private readonly translate: TranslateService,
              public appCtrl: App,
    ) {
    console.log("Hello LogoutProvider Provider");
  }

  async logout(): Promise<void> {
    // await this.menu.close();

    const user: User = await User.currentUser();
    // tslint:disable-next-line:no-null-keyword
    user.accessToken = null;
    // tslint:disable-next-line:no-null-keyword
    user.refreshToken = null;

    await user.save();

    this.loggedIn = false;
    await this.appCtrl.getRootNav().setRoot(LoginPage);

    const toast: Toast = this.toast.create(<ToastOptions>{
      message: this.translate.instant("logout.logged_out"),
      duration: 3000
    });
    await toast.present();
  }

}
