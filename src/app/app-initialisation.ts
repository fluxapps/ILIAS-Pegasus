import { APP_INITIALIZER, FactoryProvider } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { SQLite } from "@ionic-native/sqlite/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { PEGASUS_CONNECTION_NAME } from "./config/typeORM-config";
import { Settings } from "./models/settings";
import { User } from "./models/user";
import { AuthenticationProvider } from "./providers/authentication.provider";
import { SQLiteDatabaseService } from "./services/database.service";
import { Database } from "./services/database/database";
import { DB_MIGRATION, DBMigration } from "./services/migration/migration.api";


const FALLBACK_LANGUAGE: string = "de";
const SUPPORTED_LANGUAGES: Set<string> = new Set(["de", "en", "it"]);

export const INIT_APP: FactoryProvider = {
    provide: APP_INITIALIZER,
    useFactory: (
        platform: Platform,
        sqlite: SQLite,
        network: Network,
        database: Database,
        migration: DBMigration,
        translate: TranslateService,
        statusBar: StatusBar
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
            const language: string = !!navigator.language ? navigator.language : FALLBACK_LANGUAGE;
            const languages: ReadonlyArray<string> = !!navigator.languages && navigator.languages.length > 0 ?
                navigator.languages : [FALLBACK_LANGUAGE];

            const browserLanguages: Set<string> = Intl
                // @ts-ignore (TS 3.5 does not have a type dev for this intl function)
                .getCanonicalLocales([language, ...languages])
                .map((it) => it.split("-")[0])
                .reduceRight((col, child) => col.add(child), new Set()); // Sets in js are ordered

            let lng: string = FALLBACK_LANGUAGE;
            for (const langCode of browserLanguages) {
                if (SUPPORTED_LANGUAGES.has(langCode)) {
                    lng = langCode;
                    break;
                }
            }
            translate.use(lng);
        }
        translate.setDefaultLang(FALLBACK_LANGUAGE);

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

