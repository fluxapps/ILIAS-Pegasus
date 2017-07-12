import {Component} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import {Settings} from "../../models/settings";
import {FooterToolbarService} from "../../services/footer-toolbar.service";
import {TranslateService} from "ng2-translate/src/translate.service";
import {Log} from "../../services/log.service";
import {User} from "../../models/user";
import {FileData} from "../../models/file-data";
import {ILIASInstallation} from "../../models/ilias-installation";
import {AlertController} from "ionic-angular/index";
import {DataProvider} from "../../providers/data-provider.provider";
import {FileService} from "../../services/file.service";
import {DesktopItem} from "../../models/desktop-item";
import {Job} from "../../services/footer-toolbar.service";
import {ILIASConfig} from "../../config/ilias-config";

@Component({
    templateUrl: 'settings.html'
})

export class SettingsPage {

    public settingsMode = 'general';

    public settings: Settings;

    public installationsWithUsers: ILIASInstallation[];

    public totalSize: number = 0;

    /**
     * Stores the users per installation together with their used disk space on the device
     */
    public usersPerInstallation: {[installationId: number]: {user: User, diskSpace: number}[]} = {};

    public loggedInUser:User;

    constructor(public nav: NavController,
                public toast: ToastController,
                public footerToolbar: FooterToolbarService,
                public translate: TranslateService,
                public config: ILIASConfig,
                public alert: AlertController,
                public dataProvider: DataProvider,
                public fileService: FileService) {
    }

    public ionViewDidEnter() {
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

    private loadUsersAndDiskspace(): Promise<any> {
        this.usersPerInstallation = [];
        this.totalSize = 0;
        //Load installations
        Log.write(this, "loading users and diskspace");
        return this.config.get('installations').then((installations:ILIASInstallation[]) => {
            this.installationsWithUsers = installations;
            return User.findAllUsers().then(users => {
                let diskSpacePromises = [];
                users.forEach(user => {
                    if (!this.usersPerInstallation[user.installationId]) {
                        this.usersPerInstallation[user.installationId] = [];
                    }
                    let diskSpacePromise = FileData.getTotalDiskSpaceForUser(user).then(diskSpace => {
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

    public deleteLocalUserDataPrompt(user: User) {
        let alert = this.alert.create({
            title: this.translate.instant("settings.delete_user_local_data_title", {'username': user.iliasLogin}),
            subTitle: this.translate.instant("settings.delete_user_local_data_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: 'cancel',
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

    public saveSettings() {
        this.settings.downloadSize = Math.min(this.settings.downloadSize, 9999);
        this.settings.quotaSize = Math.min(this.settings.quotaSize, 99999);

        if (this.settings.userId) {
            Log.write(this, "Saving settings.");
            this.settings.save().then(() => {
                Log.write(this, "Settings saved successfully.");
                this.translate.use(this.settings.language).subscribe(() => {
                    Log.write(this, "Switching language successful.");
                    let toast = this.toast.create({
                        message: this.translate.instant("settings.settings_saved"),
                        duration: 3000
                    });
                    toast.present();
                });
            });
        }
    }

    protected deleteLocalUserData(user: User): Promise<any> {
        this.footerToolbar.addJob(Job.DeleteFilesSettings, this.translate.instant("settings.deleting_files"));
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
        let toast = this.toast.create({
            message: this.translate.instant("settings.files_deleted"),
            duration: 3000
        });
        toast.present();
    }

    protected doDeleteAllFiles() {
        return User.findAllUsers().then(users => {
            let promises = [];
            users.forEach(user => {
                promises.push(this.deleteFiles(user));
            });

            return Promise.all(promises);
        });

    }

    public deleteAllFilesPrompt() {
        let alert = this.alert.create({
            title: this.translate.instant("settings.delete_all_files"),
            subTitle: this.translate.instant("settings.delete_all_files_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: 'cancel',
                    handler: () => {
                    }
                },
                {
                    text: this.translate.instant("ok"),
                    handler: () => {
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

    protected deleteFiles(user: User): Promise<any> {
        return DesktopItem.findByUserId(user.id).then(iliasObjects => {
            let promises = [];
            iliasObjects.forEach(object => {
                promises.push(this.fileService.removeRecursive(object));
            });

            return Promise.all(promises);
        });
    }
}

