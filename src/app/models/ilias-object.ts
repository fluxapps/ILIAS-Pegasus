import {ActiveRecord, SQLiteConnector} from "./active-record";
import {FileData} from "./file-data";
import {User} from "./user";
/** services */
import {SQLiteDatabaseService} from "../services/database.service";
import {FileService} from "../services/file.service";
/** presenters */
import {ILIASObjectPresenter} from "../presenters/object-presenter";
import {ILIASObjectPresenterFactory} from "../presenters/presenter-factory";
/** logging */
import {Log} from "../services/log.service";

export class ILIASObject extends ActiveRecord {

    // A nice technique to simulate class constants :) ILIASObject.OFFLINE_OWNER_USER => 'user'
    static get OFFLINE_OWNER_USER(): string {
        return "user";
    }

    static get OFFLINE_OWNER_SYSTEM(): string {
        return "system";
    }

    /**
     * Internal user-ID
     */
    userId: number;

    /**
     * ILIAS Object-ID
     */
    objId: number;

    /**
     * ILIAS Ref-ID
     */
    refId: number;

    /**
     * Ref-ID of parent in tree
     */
    parentRefId: number;

    /**
     * ILIAS object type
     */
    type: string;

    /**
     * ILIAS object title
     */
    title: string;

    /**
     * ILIAS object description
     */
    description: string;

    /**
     * Static link to object in ILIAS
     */
    link: string;

    /**
     * Repository path in json.
     */
    _repoPath: string;

    /**
     * True if object is marked as "offline available"
     */
    isOfflineAvailable: boolean;

    /**
     * The owner that was setting this object to "offline available", either 'user' or 'system'
     */
    offlineAvailableOwner: string;

    /**
     * Object is marked as new
     */
    isNew: boolean;

    /**
     * Object is marked as updated
     */
    isUpdated: boolean;

    /**
     * Object is marked as favorite
     */
    isFavorite: number;

    /**
     * Is true iff aditional resources need to be downloaded before this object is offline available.
     */
    needsDownload: boolean;

    newSubItems: number = 0;

    hasPageLayout: boolean = false;

    hasTimeline: boolean = false;

    permissionType: string = "";

    /**
     * Holds additional data as JSON string that must be accessed in a synchronous way, e.g. FileData
     */
    protected _data: string;

    protected order: {[type: string]: number} = {
        "crs" : 1,
        "grp" : 2,
        "fold": 3,
        "file": 4
    };

    static objectsCache: {[id: number]: ILIASObject} = {};
    static promiseCache: {[id: number]: Promise<ILIASObject>} = {};

    createdAt: string;
    updatedAt: string;

    protected _presenter: ILIASObjectPresenter;

    constructor(id: number = 0) {
        super(id, new SQLiteConnector("objects", [
            "userId",
            "objId",
            "refId",
            "parentRefId",
            "type",
            "title",
            "description",
            "link",
            "isOfflineAvailable",
            "offlineAvailableOwner",
            "isNew",
            "isUpdated",
            "isFavorite",
            "data",
            "repoPath",
            "createdAt",
            "updatedAt",
            "needsDownload",
            "hasPageLayout",
            "hasTimeline",
            "permissionType"
        ]));
    }

    /**
     * Returns additional data as object
     * @returns {object}
     */
    get data(): any {
        if (this._data) {
            try {
                return JSON.parse(this._data);
            } catch (e) {
                return {}
            }
        }

        return {};
    }

    set data(data: any) {
        if (typeof data === "string") {
            this._data = data;
        } else if (typeof data === "object" && data !== null) {
            this._data = JSON.stringify(data);
        }
    }

    /**
     * Returns additional data as object
     * @returns {object}
     */
    get repoPath(): Array<string>|string {
        if (this._repoPath) {
            try {
                return JSON.parse(this._repoPath);
            } catch (e) {
                Log.error(this, "Could not get json from: " + this._repoPath);
                return [];
            }
        }

        return [];
    }

    set repoPath(path: Array<string>|string) {
        if (typeof path === "string") {
            this._repoPath = path;
        } else if (path !== null) {
            this._repoPath = JSON.stringify(path);
        } else if ( path === null) {
            this._repoPath = null;
        }else {
            Log.describe(this, "repo path is: ", path);
            throw new Error("Please provide a string or a list of strings for repoPath in ilias-object.ts");
        }
    }


    /**
     * @returns {boolean}
     */
    isContainer(): boolean {
        return (["crs", "grp", "fold"].indexOf(this.type) > -1);
    }

    isFile(): boolean {
        return this.type == "file";
    }

    /**
     * @returns {boolean} true if the object has permission visible, otherwise false
     */
    isLinked(): boolean {
      return this.permissionType == "visible";
    }

    isLearnplace(): boolean {
      return this.type == "xsrl";
    }

    /**
     * @returns {ILIASObjectPresenter}
     */
    get presenter(): ILIASObjectPresenter {
        if (!this._presenter) {
            this._presenter = ILIASObjectPresenterFactory.instance(this);
        }

        return this._presenter;
    }

    /**
     * Returns the root parent, e.g. the top container (course or group) or null
     */
    getRootParent(): Promise<ILIASObject> {
        return this.getParentsChain()
            .then(chain => Promise.resolve(chain[0]));
    }

    get rootParent(): Promise<string> {
        return this.getRootParent().then(object => object.title);
    }

    getParentsChain(): Promise<Array<ILIASObject>> {
        return this.parent.then(parentObject => {
            if (!parentObject) {
                return <Promise<Array<ILIASObject>>> Promise.resolve([this]);
            } else {
                return parentObject.getParentsChain()
                    .then(chain => {
                        chain.push(this);
                        return Promise.resolve(chain);
                    })
            }
        });
    }

    /**
     *
     * @returns {Promise<string>}
     */
    getParentsTitleChain(): Promise<Array<string>> {
        return this.getParentsChain()
            .then(items => items.map((item) => item.title));
    }

    /**
     * Returns the objects parent or null, if no parent is available
     * @returns {Promise<ILIASObject>}
     */
    get parent(): Promise<ILIASObject> {
        return new Promise((resolve, reject) => {
            ILIASObject.findByRefId(this.parentRefId, this.userId).then(parentObject => {
                if (parentObject.id) {
                    resolve(parentObject);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    /**
     * Checks whether the object is contained within a favorite-object
     */
    async objectIsUnderFavorite(): Promise<boolean> {
        const parents: Array<ILIASObject> = await this.getParentsChain();
        for(let i: number = 0; i < parents.length; i++)
            if(parents[i].isFavorite) return true;
        return false;
    }

    /**
     * gathers all iliasObjects that have been marked by the given user
     */
    static getFavoritesByUserId(userId: number, includeLoading: boolean = true): Promise<Array<ILIASObject>> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query(`SELECT * FROM objects WHERE isFavorite ${includeLoading ? "> 0" : "= 1" } AND userId = ? ORDER BY title ASC`, [userId]))
            .then((response) => {
                const favorites = [];
                for (let i = 0; i < (<any> response).rows.length; i++) {
                    favorites.push(ILIASObject.find(<number> (<any> response).rows.item(i).id))
                }
                return Promise.all(favorites);
            });
    }

    /**
     * removes the offline-data, sets the isOfflineAvailable-flags accordingly and sets isFavorite to false
     */
    async removeFromFavorites(fileService: FileService, ignoreDeletionErrors: boolean = false): Promise<void> {
        await this.setIsFavorite(0);
        const underFavorite: boolean = await this.objectIsUnderFavorite();
        const objectsStack: Array<ILIASObject> = underFavorite ? [] : [this];

        while (objectsStack.length) {
            const ilObj: ILIASObject = objectsStack.pop();

            const newObjects: Array<ILIASObject> = await ILIASObject.findByParentRefId(ilObj.refId, this.userId);
            for (let i: number = 0; i < newObjects.length; i++)
                if (!newObjects[i].isFavorite) objectsStack.push(newObjects[i]);

            try {
                await fileService.removeObject(ilObj);
            } catch (e) {
                if(!ignoreDeletionErrors) throw e;
            }
        }
    }

    /**
     * Set property 'isFavorite' of the 'iliasObject'
     */
    async setIsFavorite(value: number): Promise<void> {
        this.isFavorite = value;
        await this.save();
    }


    /**
     * Find ILIAS-Object by primary ID, returns a Promise resolving the fully loaded ILIASObject object
     * @param id
     * @returns {Promise<ILIASObject>}
     */
    static find(id: number): Promise<ILIASObject> {

        // If we already have the object, just return it.
        if (ILIASObject.objectsCache[id]) {
            return Promise.resolve(ILIASObject.objectsCache[id]);
        }

        //if the object is currently loading.
        if (ILIASObject.promiseCache[id]) {
            return new Promise((resolve, reject) => {
                ILIASObject.promiseCache[id].then(() => {
                    resolve(ILIASObject.objectsCache[id]);
                });
            });
        }

        //if the object needs to be loaded
        const iliasObject = new ILIASObject(id);
        const promise = iliasObject.read().then(() => {
            //save the object into cache
            ILIASObject.objectsCache[id] = iliasObject;
            //we are no longer loading the object.
            delete ILIASObject.promiseCache[id];
            return Promise.resolve(iliasObject);
        });

        //we save the promise so that we are aware that we are currently loading this object.
        ILIASObject.promiseCache[id] = promise;
        return promise;
    }

    /**
     * Find ILIAS-Object by Ref-ID for the given user-ID. If no Object is existing, returns a new instance!
     *
     * To check whether an existing object is returned or a new instance, check the id:
     * ILIASObject.findByRefId(150, 1).then((object) => {
     *   if (object.id > 0) {
     *     alert('exists');
     *   } else {
     *     alert('new');
     *   }
     * });
     *
     * @param refId
     * @param userId
     * @returns {Promise<ILIASObject>}
     */
    static async findByRefId(refId: number, userId: number): Promise<ILIASObject> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        const response: any = await db.query("SELECT * FROM objects WHERE refId = ? AND userId = ?", [refId, userId]);
        if (response.rows.length == 0) {
          const object: ILIASObject = new ILIASObject();
          object.userId = userId;
          return Promise.resolve(object);
        } else if(response.rows.length == 1) {
          return ILIASObject.find(response.rows.item(0).id);
        } else if(response.rows.length > 1) {

          // We find and save the object
          const object: ILIASObject = await ILIASObject.find(response.rows.item(0).id);

          // We destroy all overdue instances.
          for (let i: number = 1; i < response.rows.length; i++) {
            (await ILIASObject.find(response.rows.item(i).id)).destroy();
          }

          // After finding and deletion we return the found object.
          return object;
        }

        return new ILIASObject();
    }

    /**
     * Get ILIAS objects under a given parentRefId
     * @param parentRefId
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    static findByParentRefId(parentRefId: number, userId: number): Promise<Array<ILIASObject>> {
        const sql: string = "SELECT * FROM objects WHERE parentRefId = ? AND userId = ?";
        const parameters: Array<number> = [parentRefId, userId];
        return ILIASObject.queryDatabase(sql, parameters);

    }

    static findNewObjects(userId: number): Promise<Array<ILIASObject>> {
        const sql: string = "SELECT * FROM objects WHERE userId = ? AND (isNew = ? OR isUpdated = ?)";
        const parameters: Array<number> = [userId, 1, 1];
        return ILIASObject.queryDatabase(sql, parameters);
    }

    /**
     * collect all objects with pending downloads
     */
    static getAllOpenDownloads(user: User): Promise<Array<ILIASObject>> {
        const sql: string = "SELECT * FROM objects WHERE isFavorite = ? AND userId = ?";
        const parameters: Array<number> = [2, user.id];
        return ILIASObject.queryDatabase(sql, parameters);
    }

    protected static queryDatabase(sql: string, parameters: Array<{}>): Promise<Array<ILIASObject>> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query(sql, parameters))
            .then((response: any) => {
                const promises = [];
                for (let i = 0; i < response.rows.length; i++) {
                    promises.push(ILIASObject.find(response.rows.item(i).id));
                }

                return Promise.all(promises)
            });
    }

    /**
     * Get ILIAS objects under a given parentRefId, recursive!
     * @param parentRefId
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    static findByParentRefIdRecursive(parentRefId: number, userId: number): Promise<Array<ILIASObject>> {
        const iliasObjects: Array<ILIASObject> = [];

        return ILIASObject.findByParentRefId(parentRefId, userId).then(children => {
            const childrenPromises: Array<Promise<Array<ILIASObject>>> = [];
            children.forEach(child => {
                iliasObjects.push(child);
                childrenPromises.push(ILIASObject.findByParentRefIdRecursive(child.refId, userId));
            });
            return Promise.all(childrenPromises);
        }).then(promiseResults => {
            promiseResults.forEach((list: Array<ILIASObject>) => {
                list.forEach(child => {
                    iliasObjects.push(child);
                });
            });
            return Promise.resolve(iliasObjects);
        });
    }

    /**
     * Set property 'isOfflineAvailable' of the 'iliasObject' and its content to 'value'
     */
    static async setOfflineAvailableRecursive(iliasObject: ILIASObject, user: User, value: boolean): Promise<void> {
        ILIASObject.findByParentRefIdRecursive(iliasObject.refId, user.id).then(objects => {
            objects.push(iliasObject);
            objects.forEach(o => {
                o.isOfflineAvailable = value;
                if(value) o.offlineAvailableOwner = undefined; // TODO sync how to set this value
                o.save();
            });
        })
    }

    /**
     * updates the needsDownload state depending on the object type recursivly. This object and every parent recursively.
     * @returns {Promise<T>} returns a list of the changed objects
     */
    updateNeedsDownload(childNeedsUpdate = null): Promise<Array<ILIASObject>> {
        Log.write(this, "recursive update needs download. going through: " + this.title);
        if (this.type == "file") {
            // A file needs to check its file state and then escalate.
            return FileData.find(this.id).then(fileData => {
                if (this.id && fileData.isUpdated())
                    this.isUpdated = true;
                return this.saveAndEscalateNeedsDownload(fileData.needsDownload());
            });
        } else if (this.isContainer()) {
            //performance improvmente, if a child needs update we certainly need to update too.
            if(childNeedsUpdate !== null && childNeedsUpdate)
                return this.saveAndEscalateNeedsDownload(true);
            // A container needs to check all its children.
            return ILIASObject.findByParentRefId(this.refId, this.userId).then(objects => {
                objects = objects.filter(object => {
                    return object.needsDownload == true;
                });
                return this.saveAndEscalateNeedsDownload((objects.length > 0));
            });

        } else {
            this.needsDownload = false;
            return Promise.resolve([]);
            //we do not need to escalate. we don't even save :-)
        }
    }

    /**
     *
     * @returns {Promise<T>} return a list of all ILIASObjects touched.
     */
    protected saveAndEscalateNeedsDownload(newValue): Promise<Array<ILIASObject>> {
        if (newValue == this.needsDownload) {
            Log.write(this, `Needs download stays the same for ${this.title}. No need for escalation.`);
            return Promise.resolve([this]);
        }
        this.needsDownload = newValue;

        return this.save()
            .then(() => this.parent)
            .then((parent) => {
                if (parent) {
                    return parent.updateNeedsDownload(this.needsDownload)
                        .then((objects) => {
                        objects.push(this);
                        return Promise.resolve(objects);
                    });
                } else {
                    return Promise.resolve([this]);
                }
            });
    }

    static findByUserId(userId: number): Promise<Array<ILIASObject>> {
        const sql = "SELECT * FROM objects WHERE userId = ?";
        const parameters = [userId];
        return ILIASObject.queryDatabase(sql, parameters);
    }

    /**
     * returns 0 for crs, 1 for grp, 2 for fold, 3 for file and 9999 for all the rest.
     * @returns {number}
     */
    getOrderByType() {
        const lastPlace: number = 9999;
        const a = this.order[this.type];
        return a ? a : lastPlace;
    }

    /**
     *
     * @param a ILIASObject
     * @param b ILIASObject
     * @returns {number}
     */
    static compare(a: ILIASObject, b: ILIASObject): number {
        if (a.getOrderByType() != b.getOrderByType()) {
            return (a.getOrderByType() > b.getOrderByType()) ? 1 : -1;
        }
        if (a.type != b.type) {
            return (a.type > b.type) ? 1 : -1;
        }
        if (a.title == b.title) return 0;

        return (a.title > b.title) ? 1 : -1;
    }

    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    destroy(): Promise<{}> {
        return super.destroy();
    }
}
