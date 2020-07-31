/** angular */
import { Component, Inject, NgZone, OnDestroy, OnInit } from "@angular/core";
import { AlertController, LoadingController, NavController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { load } from "dotenv";
import { Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
/** misc */
import { CONFIG_PROVIDER, ConfigProvider } from "../../config/ilias-config";
import { DesktopItem } from "../../models/desktop-item";
/** models */
import { ILIASObject } from "../../models/ilias-object";
import { Settings } from "../../models/settings";
import { User } from "../../models/user";
import { AuthenticationProvider } from "../../providers/authentication.provider";
import { UserStorageMamager } from "../../services/filesystem/user-storage.mamager";
import { UserStorageService } from "../../services/filesystem/user-storage.service";
/** services */
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";

@Component({
    selector: "page-settings",
    templateUrl: "settings.html"
})
export class SettingsPage implements OnInit, OnDestroy {

    private readonly totalStorageSize: ReplaySubject<number> = new ReplaySubject<number>(1);
    private readonly log: Logger = Logging.getLogger(SettingsPage.name);

    settings: Settings;

    totalSize: Observable<number> = this.totalStorageSize.asObservable();
    quotaColor: Observable<string | null> = this.totalSize.pipe(
        map((it) => it > this.settings.quotaSize * 1000**2),
        map((it) => it ? 'danger' : null)
    );

    constructor(
        private readonly nav: NavController,
        private readonly toast: ToastController,
        private readonly footerToolbar: FooterToolbarService,
        private readonly translate: TranslateService,
        @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider,
        private readonly alertCtr: AlertController,
        private readonly userStorageManager: UserStorageMamager,
        private readonly userStorage: UserStorageService,
        private readonly loadingCtrl: LoadingController,
        private readonly ngZone: NgZone,
    ) {
    }

    ngOnInit(): void {
        this.ngZone.run(() => this.init());
    }

    ngOnDestroy(): void {
        this.totalStorageSize.complete();
    }

    private async init(): Promise<void> {
        this.totalStorageSize.next(0);

        // Load settings of current user
        const loggedInUser: User = AuthenticationProvider.getUser();
        const settings: Settings = await loggedInUser.settings;

        // Load all users of current app showing the used disk space
        await this.loadUsersAndDiskspace();
        this.settings = settings;
    }

    private async loadUsersAndDiskspace(): Promise<void> {
        let totalSize = 0;

        this.log.debug(() => "Loading users and diskspace");
        const users: Array<User> = await User.findAllUsers();
        for (const user of users) {
            totalSize += await this.userStorageManager.getUsedStorage(user.id);
        }

        this.totalStorageSize.next(totalSize);
    }

    async saveSettings(): Promise<void> {
        this.settings.downloadSize = Math.min(this.settings.downloadSize, 10000);
        this.settings.quotaSize = Math.min(this.settings.quotaSize, 100000);

        if (!!this.settings.userId) {
            this.log.debug(() => "Saving settings.");
            try {
                await this.settings.save();
            } catch (e) {
                this.log.error(() => `Unable to save settings, encountered error with message: "${e.message}"`);
            }

            this.log.info(() => "Settings saved successfully.");
            await this.translate.use(this.settings.language).toPromise();

            this.log.trace(() => "Switching language successful.");

            const toast: HTMLIonToastElement = await this.toast.create({
                message: this.translate.instant("settings.settings_saved"),
                duration: 3000
            });

            await toast.present();
        }
    }

    private async showFilesDeletedToast(): Promise<void> {
        const toast: HTMLIonToastElement = await this.toast.create({
            message: await this.translate.get("settings.files_deleted").toPromise(),
            duration: 3000
        });
        await toast.present();
    }

    private async showFilesDeletingToast(): Promise<void> {
        const toast: HTMLIonToastElement = await this.toast.create({
            message: await this.translate.get("Deleting files").toPromise(),
            duration: 2000
        });

        await toast.present();
    }

    private async doDeleteAllFiles(): Promise<void> {
        const users: Array<User> = await User.findAllUsers();
        for (const user of users) {
            await this.deleteFiles(user);
            await this.deleteCache(user);
        }
    }

    async deleteAllFilesPrompt(): Promise<void> {
        const alert: HTMLIonAlertElement = await this.alertCtr.create({
            header: this.translate.instant("settings.delete_all_files"),
            message: this.translate.instant("settings.delete_all_files_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                },
                {
                    text: this.translate.instant("ok"),
                    handler: async(): Promise<void> => {
                        // Lock the user to the settings page,
                        // the user may navigate to the course view which would throws random errors if the delete task is still running
                        const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({backdropDismiss: false});
                        try {
                            await loading.present();
                            this.showFilesDeletingToast();
                            this.footerToolbar.addJob(Job.DeleteFilesSettings, this.translate.instant("settings.deleting_files"));
                            await this.doDeleteAllFiles();
                            await this.loadUsersAndDiskspace()
                            this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                            await loading.dismiss();
                            this.showFilesDeletedToast();
                        } catch (error) {
                            this.log.error(() => "Unable to delete all files.");
                            await loading.dismiss();
                            this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                            this.showUnknownErrorOccurredAlert();
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    private async deleteCache(user: User): Promise<void> {
        await this.userStorage.deleteAllCache(user.id);
    }

    private async deleteFiles(user: User): Promise<void> {
        const iliasObjects: Array<ILIASObject> = await DesktopItem.findByUserId(user.id);
        for (const iliasObject of iliasObjects)
            await this.userStorage.removeRecursive(iliasObject);
    }

    private async showUnknownErrorOccurredAlert(): Promise<void> {
        const alert: HTMLIonAlertElement = await this.alertCtr.create({
            header: this.translate.instant("something_went_wrong"),
            buttons: [
                {
                    text: this.translate.instant("close"),
                    cssClass: "alertButton",
                    role: "cancel"
                }
            ]
        });

        await alert.present();
    }
}
