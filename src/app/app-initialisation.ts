import { APP_INITIALIZER, FactoryProvider } from "@angular/core";
import { Router } from "@angular/router";
import { Network } from "@ionic-native/network/ngx";
import { SQLite } from "@ionic-native/sqlite/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Config, NavController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { PEGASUS_CONNECTION_NAME } from "./config/typeORM-config";
import { Settings } from "./models/settings";
import { User } from "./models/user";
import { ObjectListPage } from "./pages/object-list/object-list";
import { AuthenticationProvider } from "./providers/authentication.provider";
import { SQLiteDatabaseService } from "./services/database.service";
import { Database } from "./services/database/database";
import { DB_MIGRATION, DBMigration } from "./services/migration/migration.api";


export const INIT_APP: FactoryProvider = {
    provide: APP_INITIALIZER,
    useFactory: (
        platform: Platform,
        sqlite: SQLite,
        network: Network,
        database: Database,
        migration: DBMigration,
        translate: TranslateService,
        statusBar: StatusBar,
        navCtrl: NavController,
        toastCtrl: ToastController,
        router: Router,
        config: Config
    ): (() => Promise<void>) => async(): Promise<void> => {
        // cordova ready
        await platform.ready();

        // Set members on classes which are not injectable
        Settings.NETWORK = network;
        SQLiteDatabaseService.SQLITE = sqlite;

        await database.ready(PEGASUS_CONNECTION_NAME);
        await migration.migrate();

        await AuthenticationProvider.loadUserFromDatabase();

        if(AuthenticationProvider.isLoggedIn()) {
            const user: User = AuthenticationProvider.getUser();
            const setting: Settings = await Settings.findByUserId(user.id);
            translate.use(setting.language);
        } else {
            // get the language of the navigator an check if it is supported. default is de
            let lng: string = "de";
            const navLng: string = navigator.language.split("-")[0];
            ["de", "en", "it"].forEach(s => {
                if (navLng.match(`/${s}/i`)) {
                    lng = s;
                }
            });
            translate.use(lng);
        }
        translate.setDefaultLang("de");

        statusBar.styleLightContent();
    },
    deps: [
        Platform,
        SQLite, Network,
        Database, DB_MIGRATION,
        TranslateService,
        StatusBar
    ],
    multi: true
};

