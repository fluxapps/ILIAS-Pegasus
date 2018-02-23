import {Component, Inject} from "@angular/core";
import {NavController, ToastController, ToastOptions, AlertController} from "ionic-angular";
import {Settings} from "../../models/settings";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {TranslateService} from "ng2-translate/src/translate.service";
import {Log} from "../../services/log.service";
import {User} from "../../models/user";
import {FileData} from "../../models/file-data";
import {CONFIG_PROVIDER, ConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {DataProvider} from "../../providers/data-provider.provider";
import {FileService} from "../../services/file.service";
import {DesktopItem} from "../../models/desktop-item";

@Component({
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

    constructor(public nav: NavController,
                public toast: ToastController,
                public footerToolbar: FooterToolbarService,
                public translate: TranslateService,
                @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider,
                public alert: AlertController,
                public dataProvider: DataProvider,
                public fileService: FileService) {
    }

    ionViewDidEnter() {
        this.init();
    }

    protected init() {

        // Load settings of current user
        User.currentUser()
            .then(user => {
                this.loggedInUser = user;
                return user.settings;
            })
            .then(settings => {
                this.settings = settings;
                return Promise.resolve();
            });

        // Load all users of current app showing the used disk space
        this.loadUsersAndDiskspace();
    }

    private loadUsersAndDiskspace(): Promise<{}> {
        this.usersPerInstallation = [];
        this.totalSize = 0;
        //Load installations
        Log.write(this, "loading users and diskspace");
        return this.configProvider.loadConfig().then((config) => {
            this.installationsWithUsers = config.installations;
            return User.findAllUsers().then(users => {
                const diskSpacePromises = [];
                users.forEach(user => {
                    if (!this.usersPerInstallation[user.installationId]) {
                        this.usersPerInstallation[user.installationId] = [];
                    }
                    const diskSpacePromise = FileData.getTotalDiskSpaceForUser(user).then(diskSpace => {
                        this.usersPerInstallation[user.installationId].push({
                            user: user,
                            diskSpace: diskSpace
                        });
                        this.totalSize += diskSpace;
                    });
                    diskSpacePromises.push(diskSpacePromise);
                });
                // Remove installations not having any users
                this.installationsWithUsers = this.installationsWithUsers.filter(installation => {
                   return installation.id in this.usersPerInstallation;
                });
                return Promise.all(diskSpacePromises);
            });
        });
   }

    deleteLocalUserDataPrompt(user: User) {
        const alert = this.alert.create({
            title: this.translate.instant("settings.delete_user_local_data_title", {"username": user.iliasLogin}),
            subTitle: this.translate.instant("settings.delete_user_local_data_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                    handler: () => {
                        // alert.dismiss();
                    }
                },
                {
                    text: this.translate.instant("ok"),
                    handler: () => {
                        this.deleteLocalUserData(user);
                    }
                }
            ]
        });
        alert.present();
    }

    saveSettings() {
        this.settings.downloadSize = Math.min(this.settings.downloadSize, 9999);
        this.settings.quotaSize = Math.min(this.settings.quotaSize, 99999);

        if (this.settings.userId) {
            Log.write(this, "Saving settings.");
            this.settings.save().then(() => {
                Log.write(this, "Settings saved successfully.");
                this.translate.use(this.settings.language).subscribe(() => {
                    Log.write(this, "Switching language successful.");
                    const toast = this.toast.create(<ToastOptions>{
                        message: this.translate.instant("settings.settings_saved"),
                        duration: 3000
                    });
                    toast.present();
                });
            });
        }
    }

    protected deleteLocalUserData(user: User): Promise<void> {
        this.footerToolbar.addJob(Job.DeleteFilesSettings,this.translate.instant("settings.deleting_files"));
        return this.deleteFiles(user)
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

    protected showFilesDeletedToast() {
        const toast = this.toast.create({
            message: this.translate.instant("settings.files_deleted"),
            duration: 3000
        });
        toast.present();
    }

    protected showFilesDeletingToast() {
        const toast = this.toast.create({
            message: this.translate.instant("Deleting files"),
            duration: 2000
        });
        toast.present();
    }

    protected doDeleteAllFiles() {
        return User.findAllUsers().then(users => {
            const promises = [];
            users.forEach(user => {
                promises.push(this.deleteFiles(user));
            });

            return Promise.all(promises);
        });

    }

    deleteAllFilesPrompt() {
        const alert = this.alert.create({
            title: this.translate.instant("settings.delete_all_files"),
            subTitle: this.translate.instant("settings.delete_all_files_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                    handler: () => {
                    }
                },
                {
                    text: this.translate.instant("ok"),
                    handler: () => {
                        this.showFilesDeletingToast();
                        this.footerToolbar.addJob(Job.DeleteFilesSettings, this.translate.instant("settings.deleting_files"));
                        this.doDeleteAllFiles().then(() => {
                            this.loadUsersAndDiskspace().then(() => {
                                this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                                this.showFilesDeletedToast();
                            })
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    protected deleteFiles(user: User): Promise<{}> {
        return DesktopItem.findByUserId(user.id).then(iliasObjects => {
            const promises = [];
            iliasObjects.forEach(object => {
                promises.push(this.fileService.removeRecursive(object));
            });

            return Promise.all(promises);
        });
    }
}
