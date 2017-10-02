import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, Events} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import {LoginPage} from '../pages/login/login';
import {SettingsPage} from '../pages/settings/settings';
import {FavoritesPage} from '../pages/favorites/favorites';
import {InfoPage} from '../pages/info/info';
import {MigrationsService} from "../services/migrations.service";
import {ObjectListPage} from "../pages/object-list/object-list";
import {FooterToolbarService} from "../services/footer-toolbar.service";
import {NewObjectsPage} from "../pages/new-objects/new-objects";
import {Log} from "../services/log.service";
import {Settings} from "../models/settings";
import {User} from "../models/user";
import {Network} from "@ionic-native/network";
import { TranslateService } from "ng2-translate/src/translate.service";
import {ToastController} from "ionic-angular";
import {SynchronizationService} from "../services/synchronization.service";
import {ModalController} from "ionic-angular";
import {SQLiteDatabaseService} from "../services/database.service";
import {SQLite} from "@ionic-native/sqlite";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav:Nav;

    rootPage:any;

    public objectListPage = ObjectListPage;
    public favoritesPage = FavoritesPage;
    public newObjectsPage = NewObjectsPage;
    public settingsPage = SettingsPage;
    public infoPage = InfoPage;
    public loginPage = LoginPage;
    public loggedIn = false;
    /**
     * The current logged in user
     */
    protected user:User;

  /**
   *
   * This constructor sets on classes which are not injectable yet
   * member instances. This is a workaround for Ionic 3 update with
   * the current app architecture. This will be changed on release 2.0.0.
   *
   * @param {Platform} platform
   * @param {MenuController} menu
   * @param {MigrationsService} migrations
   * @param {FooterToolbarService} footerToolbar
   * @param {TranslateService} translate
   * @param {Events} event
   * @param {ToastController} toast
   * @param {SynchronizationService} sync
   * @param {ModalController} modal
   * @param {StatusBar} statusBar
   * @param {Network} network
   * @param {SQLite} sqlite
   */
    constructor(public platform:Platform,
                public menu:MenuController,
                public migrations:MigrationsService,
                public footerToolbar:FooterToolbarService,
                public translate:TranslateService,
                public event:Events,
                public toast:ToastController,
                public sync:SynchronizationService,
                public modal:ModalController,
                private readonly statusBar: StatusBar,
                private readonly network: Network,
                sqlite: SQLite
    ) {

      // Set members on classes which are not injectable
      Settings.NETWORK = this.network;
      SQLiteDatabaseService.SQLITE = sqlite;


        //we initialize the app => db migration, //get global events.
        this.initializeApp()
            .then(() => this.loadCurrentUser())
            .then(() => {
                (<any> navigator).splashscreen.hide();
                return Promise.resolve();
            })
            // .then(sync.hasUnfinishedSync)
            // .then(() => sync.execute())
            // .then(syncResult => {
            //     if (syncResult.objectsLeftOut.length > 0) {
            //         let syncModal = this.modal.create(SyncFinishedModal, {syncResult: syncResult});
            //         syncModal.present();
            //     } else {
            //         let toast = this.toast.create({
            //             message: this.translate.instant("sync.success"),
            //             duration: 3000
            //         });
            //         toast.present();
            //     }
            // })
            // SYNC Nur wenn och eine offen war, lasse dies drin, wird vielleicht nochmals gebraucht ;)
            // .catch(exception => {
            //     if (exception == "NoSyncOpenException") {
            //         Log.write(this, "No sync running.");
            //         return Promise.resolve();
            //     }
            //     return Promise.reject(exception);
            // }) // The NoSyncOpeNException is used to cancel the chain, we just log that there's nothing more to do.
            .catch(error => {
                Log.error(this, error)
            }); // Any Errors occuring during initialization get logged.
    }

    initializeApp():Promise<any> {
        return this.platform.ready().then(() => {
            Log.write(this, "Platform ready.");
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleLightContent();
            this.handleGlobalEvents();

            return this.handleMigrations();
        });
    }

    handleMigrations():Promise<any> {
        // return this.migrations.reverse(1).then( () => {
            return this.executeAllMigrations();
        // });
    }

    protected loadCurrentUser():Promise<User> {
        return User.currentUser()
            .then(user => {
                this.loggedIn = true;
                this.user = user;
                return this.translateConfig(user);
            }, () => {
                this.translateConfigDefault();
                this.rootPage = LoginPage;
                (<any> navigator).splashscreen.hide();
                Log.write(this, "No user found.");
                return Promise.reject("No user found.");
            })
            .then(user => {
                Log.write(this, "set root page to object list page");
                this.nav.setRoot(ObjectListPage);
                return Promise.resolve(user);
            });
    }

    private executeAllMigrations() {
        return this.migrations.executeAll().catch(error => {
            Log.write(this, "Some migrations were rejected...");
            Log.error(this, error);
        });
    };

    handleGlobalEvents() {
        this.event.subscribe("doLogout", () => {
            this.logout();
        });

        // TODO: we need a user service...
        this.event.subscribe("login", () => {
            // this.loggedIn = true;
            // this.nav.setRoot(ObjectListPage);
            this.loadCurrentUser();
        });
        this.event.subscribe("logout", () => {
            this.loggedIn = false;
        });
        this.network.onDisconnect().subscribe(() => {
            this.footerToolbar.offline = true;
        });
        this.network.onConnect().subscribe(() => {
            this.footerToolbar.offline = false;
        });
    }

    protected logout() {
        this.menu.close();

        User.currentUser().then(user => {
            user.accessToken = null;
            user.refreshToken = null;
            user.save().then(() => {
                // this.event.publish("logout");
                this.loggedIn = false;
                this.nav.setRoot(LoginPage);
            }).catch(err => {
                Log.error(this, err);
            });
        });

        let toast = this.toast.create({
            message: this.translate.instant("logout.logged_out"),
            duration: 3000
        });
        toast.present();
    }

    translateConfig(user:User):Promise<User> {
        return Settings.findByUserId(user.id).then(settings => {
            Log.write(this, "Using settings language: " + settings.language);
            this.translate.use(settings.language);
            this.translate.setDefaultLang('de');
            return Promise.resolve(user);
        });
    }

    translateConfigDefault():void {
        Log.write(this, "Using Default translation.");
        let userLang = navigator.language.split('-')[0]; // use navigator lang if available
        userLang = /(de|en)/gi.test(userLang) ? userLang : 'de';

        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang('de');
        this.translate.use(userLang);
    }

    public openPage(page) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        // navigate to the new page if it is not the current page
        this.nav.push(page);
    }
}
