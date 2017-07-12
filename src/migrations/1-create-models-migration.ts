import {BaseMigration} from "./migration";
import {SQLiteDatabaseService} from "../services/database.service";

export class CreateModelsMigration extends BaseMigration {

    up():Promise<any> {
        return new Promise((resolve, reject) => {

            SQLiteDatabaseService.instance().then(db => {
                // users
                var users = db.query(
                    'CREATE TABLE IF NOT EXISTS users ( ' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                    'iliasUserId INTEGER,' +
                    'iliasLogin TEXT,' +
                    'installationId INTEGER,' +
                    'accessToken TEXT,' +
                    'refreshToken TEXT,' +
                    'lastTokenUpdate INTEGER' +
                    ')'
                ).then((data) => {
                    console.log("Created table users");
                }, (error) => {
                    console.log("Could not create table users");
                });

                // objects
                var objects = db.query(
                    'CREATE TABLE IF NOT EXISTS objects ( ' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                    'userId INTEGER,' +
                    'objId INTEGER,' +
                    'refId INTEGER,' +
                    'parentRefId INTEGER,' +
                    'type TEXT,' +
                    'title TEXT,' +
                    'description TEXT,' +
                    'link TEXT,' +
                    'isOfflineAvailable INTEGER,' +
                    'offlineAvailableOwner TEXT,' +
                    'isNew INTEGER,' +
                    'isUpdated INTEGER,' +
                    'isFavorite INTEGER,' +
                    'data TEXT,' +
                    'repoPath TEXT,' +
                    'needsDownload INTEGER,' +
                    'createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,' +
                    'updatedAt DATETIME' +
                    ')'
                ).then((data) => {
                    console.log("Created table objects");
                }, (error) => {
                    console.log("Could not create table objects");
                });

                // files
                var files = db.query(
                    'CREATE TABLE IF NOT EXISTS files ( ' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                    'iliasObjectId INTEGER,' +
                    'fileName TEXT,' +
                    'fileSize INTEGER,' +
                    'fileType TEXT,' +
                    'fileExtension TEXT,' +
                    'fileVersionDate DATETIME,' +
                    'fileVersionDateLocal DATETIME' +
                    ')'
                ).then((data) => {
                    console.log("Created table files");
                }, (error) => {
                    console.log("Could not create table files");
                });

                // desktop
                var desktop = db.query(
                    'CREATE TABLE IF NOT EXISTS desktop ( ' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                    'userId INTEGER,' +
                    'objId INTEGER' +
                    ')'
                ).then((data) => {
                    console.log("Created table desktop");
                }, (error) => {
                    console.log("Could not create table desktop");
                });


                // sync
                var sync = db.query(
                    'CREATE TABLE IF NOT EXISTS synchronization ( ' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                    'userId INTEGER,' +
                    'startDate DATETIME,' +
                    'endDate DATETIME,' +
                    'isRunning INTEGER' +
                    ')'
                ).then((data) => {
                    console.log("Created table synchronization");
                }, (error) => {
                    console.log("Could not create table synchronization");
                });

                // settings
                var settings = db.query(
                    'CREATE TABLE IF NOT EXISTS settings ( ' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                    'userId INTEGER,' +
                    'language TEXT,' +
                    'downloadSize INTEGER,' +
                    'quotaSize INTEGER,' +
                    'downloadWlan INTEGER' +
                    ')'
                ).then((data) => {
                    console.log("Created table settings");
                }, (error) => {
                    console.log("Could not create table settings");
                });

                Promise.all([
                    users,
                    objects,
                    files,
                    desktop,
                    sync,
                    settings
                ]).then(() => {
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        });

    }

    down():Promise<any> {
        return new Promise((resolve, reject) => {

            SQLiteDatabaseService.instance().then(db => {
                var users = db.query("DROP TABLE IF EXISTS users");
                var objects = db.query("DROP TABLE IF EXISTS objects");
                var files = db.query("DROP TABLE IF EXISTS files");
                var file = db.query("DROP TABLE IF EXISTS file");
                var desktop = db.query("DROP TABLE IF EXISTS desktop");
                var sync = db.query("DROP TABLE IF EXISTS synchronization");
                var settings = db.query("DROP TABLE IF EXISTS settings");

                Promise.all([
                    users,
                    objects,
                    files,
                    file,
                    desktop,
                    sync,
                    settings
                ]).then( () => {
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }
}