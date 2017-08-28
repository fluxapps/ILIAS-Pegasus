import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import { MyApp } from './app.component';
import {ILIASConfig} from "../config/ilias-config";
import {HttpModule, Http} from '@angular/http';
import {ConnectionService} from "../services/ilias-app.service";
import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {MigrationsService} from "../services/migrations.service";
import {FooterToolbarService} from "../services/footer-toolbar.service";
import {FileService} from "../services/file.service";
import {DataProvider} from "../providers/data-provider.provider";
import {ObjectListPage} from "../pages/object-list/object-list";
import {FavoritesPage} from "../pages/favorites/favorites";
import {NewObjectsPage} from "../pages/new-objects/new-objects";
import {SettingsPage} from "../pages/settings/settings";
import {InfoPage} from "../pages/info/info";
import {SynchronizationService} from "../services/synchronization.service";
import {DataProviderFileObjectHandler} from "../providers/handlers/file-object-handler";
import {FileSizePipe} from "../pipes/fileSize.pipe";
import {TranslateModule} from 'ng2-translate/ng2-translate';
import {TranslateLoader} from "ng2-translate/src/translate.service";
import {TranslateStaticLoader} from "ng2-translate/src/translate.service";
import {ObjectDetailsPage} from "../pages/object-details/object-details";
import {LoginPage} from "../pages/login/login";
import {ModalPage} from "../pages/modal/modal";
import {SyncFinishedModal} from "../pages/sync-finished-modal/sync-finished-modal";
import {TokenLinkRewriter} from "../services/link-rewriter.service";


export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    ObjectListPage,
    FavoritesPage,
    NewObjectsPage,
    SettingsPage,
    InfoPage,
    ObjectDetailsPage,
    LoginPage,
    FileSizePipe,
    SyncFinishedModal,
    ModalPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ObjectListPage,
    FavoritesPage,
    NewObjectsPage,
    SettingsPage,
    InfoPage,
    ObjectDetailsPage,
    LoginPage,
    SyncFinishedModal,
  ],
  providers: [
    ILIASConfig,
    ConnectionService,
    MigrationsService,
    ILIASRestProvider,
    FooterToolbarService,
    DataProvider,
    FileService,
    SynchronizationService,
    DataProviderFileObjectHandler,
    TokenLinkRewriter,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ],
  exports: [
    TranslateModule
  ]
})
export class AppModule {}

