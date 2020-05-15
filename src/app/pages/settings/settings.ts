/** angular */
import {Component, Inject, NgZone} from "@angular/core";
import {AlertController, Config, NavController, ToastController} from "@ionic/angular";
/** services */
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {FileService} from "../../services/file.service";
/** models */
import {ILIASObject} from "../../models/ilias-object";
import {Settings} from "../../models/settings";
import {User} from "../../models/user";
import {DesktopItem} from "../../models/desktop-item";
/** logging */
import {Log} from "../../services/log.service";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {CONFIG_PROVIDER, ConfigProvider, ILIASConfig, ILIASInstallation} from "../../config/ilias-config";
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {UserStorageService} from "../../services/filesystem/user-storage.service";
import {File} from "@ionic-native/file/ngx";

@Component({
    selector: "page-settings",
    templateUrl: "settings.html"
})
export class SettingsPage {

    settingsMode: string = "general";

    settings: Settings;

    installationsWithUsers: Array<ILIASInstallation>;

    totalSize: number = 0;

    /**
     * Stores the users per installation together with their used disk space on the device
     */
    usersPerInstallation: {[installationId: number]: Array<{user: User, diskSpace: number}>} = {};

    loggedInUser: User;

    private readonly log: Logger = Logging.getLogger(SettingsPage.name);

    constructor(public nav: NavController,
                public toast: ToastController,
                public footerToolbar: FooterToolbarService,
                public translate: TranslateService,
                @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider,
                public alertCtr: AlertController,
                public fileService: FileService,
                private readonly userStorage: UserStorageService,
                private readonly config: Config,
                private readonly ngZone: NgZone,
                private readonly file: File) {
    }

    ionViewDidEnter(): void {
        this.ngZone.run(() => this.init());
    }

    private init(): void {

        // Load settings of current user
        this.loggedInUser = AuthenticationProvider.getUser();
        this.loggedInUser.settings.then(s => this.settings = s);

        // Load all users of current app showing the used disk space
        this.loadUsersAndDiskspace();
    }

    private async loadUsersAndDiskspace(): Promise<void> {
        this.usersPerInstallation = [];
        this.totalSize = 0;

        Log.write(this, "loading users and diskspace");
        const config: ILIASConfig = await this.configProvider.loadConfig();
        this.installationsWithUsers = config.installations;
        const users: Array<User> = await User.findAllUsers();
        for(const user of users) {
            if (!this.usersPerInstallation[user.installationId]) {
                this.usersPerInstallation[user.installationId] = [];
            }
            const diskSpace: number = await UserStorageService.getUsedStorage(user.id);
            this.usersPerInstallation[user.installationId].push({
                user: user,
                diskSpace: diskSpace
            });
            this.totalSize += diskSpace;
        }

        // Remove installations not having any users
        this.installationsWithUsers = this.installationsWithUsers.filter(installation => {
            return installation.id in this.usersPerInstallation;
        });
    }

    deleteLocalUserDataPrompt(user: User): void {
        this.alertCtr.create({
            header: this.translate.instant("settings.delete_user_local_data_title", {"username": user.iliasLogin}),
            message: this.translate.instant("settings.delete_user_local_data_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                    handler: (): void => {
                        // alert.dismiss();
                    }
                },
                {
                    text: this.translate.instant("ok"),
                    handler: (): void => {
                        this.deleteLocalUserData(user);
                    }
                }
            ]
        }).then((it: HTMLIonAlertElement) => it.present());
    }

    async saveSettings(): Promise<void> {
        this.settings.downloadSize = Math.min(this.settings.downloadSize, 10000);
        this.settings.quotaSize = Math.min(this.settings.quotaSize, 100000);

        if (this.settings.userId) {
            this.log.debug(() => "Saving settings.");
            try {
                await this.settings.save();
            } catch (e) {
                console.log(`ERR ${e.message}`);
            }

            this.log.info(() => "Settings saved successfully.");
            await this.translate.use(this.settings.language).toPromise();

            this.log.trace(() => "Switching language successful.");
            this.config.set("backButtonText", this.translate.instant("back"));

            await this.toast.create({
                message: this.translate.instant("settings.settings_saved"),
                duration: 3000
            }).then((it: HTMLIonToastElement) => it.present());
        }
    }

    private deleteLocalUserData(user: User): Promise<void> {
        this.footerToolbar.addJob(Job.DeleteFilesSettings,this.translate.instant("settings.deleting_files"));
        return this.deleteFiles(user)
            .then(() => this.userStorage.computeUsedStorage(user.id, this.file))
            .then(() => this.loadUsersAndDiskspace())
            .then(() => {
                this.showFilesDeletedToast();
                this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                return Promise.resolve();
            }).catch(err => {
                this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                return Promise.reject(err);
            });
    }

    private showFilesDeletedToast(): void {
        this.toast.create({
            message: this.translate.instant("settings.files_deleted"),
            duration: 3000
        }).then((it: HTMLIonToastElement) => it.present());
    }

    private showFilesDeletingToast(): void {
        this.toast.create({
            message: this.translate.instant("Deleting files"),
            duration: 2000
        }).then((it: HTMLIonToastElement) => it.present());
    }

    private async doDeleteAllFiles(): Promise<void> {
        const users: Array<User> = await User.findAllUsers();
        for(const user of users)
            await this.deleteFiles(user);
    }

    deleteAllFilesPrompt(): void {
        this.alertCtr.create({
            header: this.translate.instant("settings.delete_all_files"),
            message: this.translate.instant("settings.delete_all_files_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                },
                {
                    text: this.translate.instant("ok"),
                    handler: (): void => {
                        this.showFilesDeletingToast();
                        this.footerToolbar.addJob(Job.DeleteFilesSettings, this.translate.instant("settings.deleting_files"));
                        this.doDeleteAllFiles().then(() => {
                            this.loadUsersAndDiskspace().then(() => {
                                this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                                this.showFilesDeletedToast();
                            }).catch((error): void => {
                                this.log.error(() => `Unable to load user and disk space with error ${JSON.stringify(error)}`);
                                this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                                this.showUnknownErrorOccurredAlert();
                            });
                        }).catch((): void => {
                            this.log.error(() => "Unable to delete all files.");
                            this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                            this.showUnknownErrorOccurredAlert();
                        });
                    }
                }
            ]
        }).then((it: HTMLIonAlertElement) => it.present());
    }

    private async deleteFiles(user: User): Promise<void> {
        const iliasObjects: Array<ILIASObject> = await DesktopItem.findByUserId(user.id);
        for(const iliasObject of iliasObjects)
            await this.fileService.removeRecursive(iliasObject);
    }

    private async showUnknownErrorOccurredAlert(): Promise<void> {
        await this.alertCtr.create({
            header: this.translate.instant("something_went_wrong"),
            buttons: [
                {
                    text: this.translate.instant("close"),
                    cssClass: "alertButton",
                    role: "cancel"
                }
            ]
        }).then((it: HTMLIonAlertElement) => it.present());
    }
}
