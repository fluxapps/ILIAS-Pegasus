import {Component, Inject, ViewChild} from "@angular/core";
import {Network} from "@ionic-native/network";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SQLite} from "@ionic-native/sqlite";
import {StatusBar} from "@ionic-native/status-bar";
import {Config, Events, MenuController, ModalController, Nav, Platform, Toast, ToastController, ToastOptions} from "ionic-angular";
import {TranslateService} from "ng2-translate/src/translate.service";
import {PEGASUS_CONNECTION_NAME} from "../config/typeORM-config";
import {Settings} from "../models/settings";
import {User} from "../models/user";
import {FavoritesPage} from "../pages/favorites/favorites";
import {LoginPage} from "../pages/login/login";
import {NewObjectsPage} from "../pages/new-objects/new-objects";
import {ObjectListPage} from "../pages/object-list/object-list";
import {OnboardingPage} from "../pages/onboarding/onboarding";
import {SettingsPage} from "../pages/settings/settings";
import {TabmenuPage} from "../pages/tabmenu/tabmenu";
import {ThemeProvider} from "../providers/theme";
import {SQLiteDatabaseService} from "../services/database.service";
import {Database} from "../services/database/database";
import {FooterToolbarService, Job} from "../services/footer-toolbar.service";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
import {DB_MIGRATION, DBMigration} from "../services/migration/migration.api";
import {SynchronizationService} from "../services/synchronization.service";
import {LoadingPage} from "./fallback/loading/loading.component";
import {SynchronizationPage} from "./fallback/synchronization/synchronization.component";
import getMessage = Logging.getMessage;
import {Profiler} from "../util/profiler";


@Component({
  templateUrl: "app.html",
  providers: [ThemeProvider, Profiler]
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage: {};
  tabmenuPage: object = TabmenuPage;
  objectListPage: object = ObjectListPage;
  favoritesPage: object = FavoritesPage;
  newObjectsPage: object = NewObjectsPage;
  settingsPage: object = SettingsPage;
  loginPage: object = LoginPage;
  onboardingPage: object = OnboardingPage;
  newsPage: string = "NewsPage"; //needs to be string in order to get lazy loaded
  LoadingPage: object = LoadingPage;
  SynchronizationPage: object = SynchronizationPage;
  loggedIn: boolean = false;
  /**
   * The current logged in user
   */
  private user: User;

  private readonly log: Logger = Logging.getLogger(MyApp.name);

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
     * @param modal
     * @param config
     * @param {DBMigration} dbMigration
     * @param {SQLite} sqlite
     * @param theme
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
    private readonly modal: ModalController,
    private readonly config: Config,
    @Inject(DB_MIGRATION) private readonly dbMigration: DBMigration,
    sqlite: SQLite,
    readonly theme: ThemeProvider
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

      //check if we navigating the object list
      if (this.nav.last().component == ObjectListPage) {
        //preserve history
        await this.nav.push(page);
      } else {
        //we are navigating over the menu remove history
        await this.nav.push(page);
        await this.nav.remove(1);
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
    this.nav.push(OnboardingPage);

  }
  // presentLoading(): void {
  //   this.menu.close();
  //   let loadingModal = this.modalCtrl.create(LoadingPage);
  //   loadingModal.present();
  // }

  /**
   * Initialize everything that has to be done on start up.
   */
  private async initializeApp(): Promise<void> {

    this.log.info(() => "Initialize app");
    this.statusBar.styleLightContent();
    this.subscribeOnGlobalEvents();
    this.defineBackButtonAction();

    await this.database.ready(PEGASUS_CONNECTION_NAME);
    await this.dbMigration.migrate();

    await this.setRootPage();

    // overwrite ionic back button text with configured language
    this.config.set("backButtonText", this.translate.instant("back"));

    this.splashScreen.hide();

    this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
    await this.sync.liveLoad(undefined);
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
      await this.nav.setRoot(this.tabmenuPage);

    } catch(error) {

      this.configureDefaultTranslation();
      this.rootPage = this.loginPage;
      this.presentOnboardingModal();
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

   //TODO: Delete as it is now in logout provider
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

 // tslint:disable-next-line:typedef
 presentOnboardingModal() {
    // tslint:disable-next-line:typedef
    const onboardingModal = this.modal.create(OnboardingPage,
      undefined,
      { cssClass: "modal-fullscreen" }
    );
    onboardingModal.present();
  }

}
