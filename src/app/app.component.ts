import {Component, Inject, ViewChild} from "@angular/core";
import {
  Platform, MenuController, Nav, Events, ToastController, Toast,
  ToastOptions
} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {LoginPage} from "../pages/login/login";
import {SettingsPage} from "../pages/settings/settings";
import {FavoritesPage} from "../pages/favorites/favorites";
import {InfoPage} from "../pages/info/info";
import {ObjectListPage} from "../pages/object-list/object-list";
import {FooterToolbarService, Job} from "../services/footer-toolbar.service";
import {NewObjectsPage} from "../pages/new-objects/new-objects";
import {Log} from "../services/log.service";
import {Settings} from "../models/settings";
import {User} from "../models/user";
import {Network} from "@ionic-native/network";
import {TranslateService} from "ng2-translate/src/translate.service";
import {SynchronizationService} from "../services/synchronization.service";
import {SQLiteDatabaseService} from "../services/database.service";
import {SQLite} from "@ionic-native/sqlite";
import {TabsPage} from "../learnplace/pages/tabs/tabs.component";
import {PEGASUS_CONNECTION_NAME} from "../config/typeORM-config";
import {SplashScreen} from "@ionic-native/splash-screen";
import {Database} from "../services/database/database";
import {DB_MIGRATION, DBMigration} from "../services/migration/migration.api";

@Component({
  templateUrl: "app.html"
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage: {};

  objectListPage: object = ObjectListPage;
  favoritesPage: object = FavoritesPage;
  newObjectsPage: object = NewObjectsPage;
  settingsPage: object = SettingsPage;
  infoPage: object = InfoPage;
  loginPage: object = LoginPage;
  loggedIn: boolean = false;
  /**
   * The current logged in user
   */
  private user: User;

  /**
   *
   * This constructor sets on classes which are not injectable yet
   * member instances. This is a workaround for Ionic 3 update with
   * the current app architecture. This will be changed on release 2.0.0.
   *
   * @param {Platform} platform
   * @param {MenuController} menu
   * @param {FooterToolbarService} footerToolbar
   * @param {TranslateService} translate
   * @param {Events} event
   * @param {ToastController} toast
   * @param {SynchronizationService} sync
   * @param {StatusBar} statusBar
   * @param {Network} network
   * @param {SplashScreen} splashScreen
   * @param {Database} database
   * @param {DBMigration} dbMigration
   * @param {SQLite} sqlite
   */
  constructor(
    readonly footerToolbar: FooterToolbarService,
    private readonly platform: Platform,
    private readonly menu: MenuController,
    private readonly translate: TranslateService,
    private readonly event: Events,
    private readonly toast: ToastController,
    private readonly sync: SynchronizationService,
    private readonly statusBar: StatusBar,
    private readonly network: Network,
    private readonly splashScreen: SplashScreen,
    private readonly database: Database,
    @Inject(DB_MIGRATION) private readonly dbMigration: DBMigration,
    sqlite: SQLite
  ) {

    // Set members on classes which are not injectable
    Settings.NETWORK = this.network;
    SQLiteDatabaseService.SQLITE = sqlite;

    // init after platform is ready and native stuff is available
    this.platform.ready().then(() => {

      Log.write(this, "Platform ready.");
      return this.initializeApp();
    }).catch(error => console.log(JSON.stringify(error)));
  }

  /**
   * Opens the given {@code page}.
   *
   * If the page is an {@link ObjectListPage}, it wll be set as root page.
   * If the previous page is an {@link ObjectListPage}, the given page will be pushed to the nav.
   * Otherwise the nav will be popped and than the given page will be pushed.
   *
   * @param {object} page - the page to open
   */
  async openPage(page: object): Promise<void> {

    await this.menu.close();

    if (page == ObjectListPage) {
      await this.nav.setRoot(page);
    } else {

      if (this.nav.last().component == ObjectListPage) {
        await this.nav.push(page);
      } else {
        await this.nav.pop();
        await this.nav.push(page)
      }
    }
  }

  /**
   * ONLY FOR TESTING PURPOSES!!!
   *
   * Push the page you wanna open to the nav.
   */
  openTestpage(): void {
    this.menu.close();
    this.nav.push(TabsPage);
  }

  /**
   * Initialize everything that has to be done on start up.
   */
  private async initializeApp(): Promise<void> {

    console.log("initialize App");
    this.statusBar.styleLightContent();
    this.subscribeOnGlobalEvents();
    this.defineBackButtonAction();

    console.log("setup database");
    await this.database.ready(PEGASUS_CONNECTION_NAME);
    console.log("Run migration");
    await this.dbMigration.migrate();

    console.log("Set root page");
    await this.setRootPage();

    // (<{}> navigator).splashscreen.hide();
    this.splashScreen.hide();

    this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
    await this.sync.execute();
    this.footerToolbar.removeJob(Job.Synchronize);
  }

  /**
   * Subscribes on global events that are used.
   */
  private subscribeOnGlobalEvents(): void {

    this.event.subscribe("doLogout", () => this.logout());

    this.event.subscribe("login", () => this.setRootPage());

    this.event.subscribe("logout", () => this.loggedIn = false);

    this.network.onDisconnect().subscribe(() => this.footerToolbar.offline = true);

    this.network.onConnect().subscribe(() => this.footerToolbar.offline = false);
  }

  /**
   * Sets the root page depending on the current user.
   *
   * If no current user is found, the {@link LoginPage} will be
   * set as the root page.
   */
  private async setRootPage(): Promise<void> {

    try {

      const user: User = await User.currentUser();
      this.loggedIn = true;
      this.user = user;
      await this.configureTranslation(user);
      await this.nav.setRoot(this.objectListPage);

    } catch(error) {

      this.configureDefaultTranslation();
      this.rootPage = this.loginPage;
    }
  }

  /**
   * Configures the {@link TranslateService} depending on the given {@code user}.
   *
   * @param {User} user - the user to read its configured language
   */
  private async configureTranslation(user: User): Promise<void> {

    const setting: Settings = await Settings.findByUserId(user.id);

    this.translate.use(setting.language);
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
   * Performs all steps to log out the user.
   */
  async logout(): Promise<void> {
    await this.menu.close();

    const user: User = await User.currentUser();
    user.accessToken = null;
    user.refreshToken = null;

    await user.save();

    this.loggedIn = false;
    await this.nav.setRoot(LoginPage);

    const toast: Toast = this.toast.create(<ToastOptions>{
      message: this.translate.instant("logout.logged_out"),
      duration: 3000
    });
    await toast.present();
  }

  /**
   * Registers a action for the back button.
   */
  private defineBackButtonAction(): void {

    let backbuttonTapped: number = 0;

    this.platform.registerBackButtonAction(() => {
      if (this.menu.isOpen()) {
        this.menu.close();
        return;
      }
      if (!this.nav.canGoBack()) {
        if (backbuttonTapped == 0) {
          backbuttonTapped = 1;
          const toast: Toast = this.toast.create({
            message: this.translate.instant("message.back_to_exit"),
            duration: 3000
          });
          toast.present();
          setTimeout(() => {
            backbuttonTapped = 0;
          }, 3000);
        } else {
          this.platform.exitApp();
        }
      } else {
        this.nav.pop();
      }
    });
  }
}
