/** angular */
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {NavController, ToastController} from "@ionic/angular";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {User} from "../../models/user";
import {LoginPage} from "../../pages/login/login";

/*
  Generated class for the LogoutProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
    providedIn: "root"
})
export class LogoutProvider {
  private user: User;

  loginPage: any = LoginPage;
  loggedIn: boolean = false;

  constructor(public http: HttpClient,
              private readonly toast: ToastController,
              private readonly translate: TranslateService,
              private readonly nav: NavController
    ) {}

  async logout(): Promise<void> {
    // await this.menu.close();

    const user: User = await User.currentUser();
    // tslint:disable-next-line:no-null-keyword
    user.accessToken = null;
    // tslint:disable-next-line:no-null-keyword
    user.refreshToken = null;

    await user.save();

    this.loggedIn = false;
    this.nav.navigateRoot("");

    await this.toast.create({
      message: this.translate.instant("logout.logged_out"),
      duration: 3000
    }).then((it: HTMLIonToastElement) => it.present());
  }

}
