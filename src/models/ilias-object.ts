import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {ILIASObjectPresenter} from "../presenters/object-presenter";
import {ILIASObjectPresenterFactory} from "../presenters/presenter-factory";
import {FileData} from "./file-data";
import {Log} from "../services/log.service";

export class ILIASObject extends ActiveRecord {

    // A nice technique to simulate class constants :) ILIASObject.OFFLINE_OWNER_USER => 'user'
    public static get OFFLINE_OWNER_USER(): string {
        return 'user';
    }

    public static get OFFLINE_OWNER_SYSTEM(): string {
        return 'system';
    }

    /**
     * Internal user-ID
     */
    public userId: number;

    /**
     * ILIAS Object-ID
     */
    public objId: number;

    /**
     * ILIAS Ref-ID
     */
    public refId: number;

    /**
     * Ref-ID of parent in tree
     */
    public parentRefId: number;

    /**
     * ILIAS object type
     */
    public type: string;

    /**
     * ILIAS object title
     */
    public title: string;

    /**
     * ILIAS object description
     */
    public description: string;

    /**
     * Static link to object in ILIAS
     */
    public link: string;

    /**
     * Repository path in json.
     */
    public _repoPath: string;

    /**
     * True if object is marked as "offline available"
     */
    public isOfflineAvailable: boolean;

    /**
     * The owner that was setting this object to "offline available", either 'user' or 'system'
     */
    public offlineAvailableOwner: string;

    /**
     * Object is marked as new
     */
    public isNew: boolean;

    /**
     * Object is marked as updated
     */
    public isUpdated: boolean;

    /**
     * Object is marked as favorite
     */
    public isFavorite: boolean;

    /**
     * Is true iff aditional resources need to be downloaded before this object is offline available.
     */
    public needsDownload: boolean;

    public newSubItems: number = 0;

    public hasPageLayout: boolean = false;

    public hasTimeline: boolean = false;

    public permissionType: string = "";

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

    public static objectsCache: {[id: number]: ILIASObject} = {};
    public static promiseCache: {[id: number]: Promise<ILIASObject>} = {};

    public createdAt: string;
    public updatedAt: string;

    protected _presenter: ILIASObjectPresenter;

    constructor(id = 0) {
        super(id, new SQLiteConnector('objects', [
            'userId',
            'objId',
            'refId',
            'parentRefId',
            'type',
            'title',
            'description',
            'link',
            'isOfflineAvailable',
            'offlineAvailableOwner',
            'isNew',
            'isUpdated',
            'isFavorite',
            'data',
            'repoPath',
            'createdAt',
            'updatedAt',
            'needsDownload',
            'hasPageLayout',
            'hasTimeline',
            'permissionType'
        ]));
    }

    /**
     * Returns additional data as object
     * @returns {object}
     */
    public get data(): any {
        if (this._data) {
            try {
                return JSON.parse(this._data);
            } catch (e) {
                return {}
            }
        }

        return {};
    }

    public set data(data) {
        if (typeof data === 'string') {
            this._data = data;
        } else if (typeof data === 'object' && data !== null) {
            this._data = JSON.stringify(data);
        }
    }

    /**
     * Returns additional data as object
     * @returns {object}
     */
    public get repoPath(): string[]|string {
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

    public set repoPath(path: string[]|string) {
        if (typeof path === 'string') {
            this._repoPath = path;
        } else if (path !== null) {
            this._repoPath = JSON.stringify(path);
        } else if ( path === null) {
            this._repoPath = null;
        }else {
            Log.describe(this, "repo path is: ", path)
            throw new Error("Please provide a string or a list of strings for repoPath in ilias-object.ts");
        }
    }


    /**
     * @returns {boolean}
     */
    public isContainer(): boolean {
        return (['crs', 'grp', 'fold'].indexOf(this.type) > -1);
    }

    /**
     * @returns {ILIASObjectPresenter}
     */
    public get presenter(): ILIASObjectPresenter {
        if (!this._presenter) {
            this._presenter = ILIASObjectPresenterFactory.instance(this);
        }

        return this._presenter;
    }

    /**
     * Returns the root parent, e.g. the top container (course or group) or null
     */
    public getRootParent(): Promise<ILIASObject> {
        return this.getParentsChain()
            .then(chain => Promise.resolve(chain[0]));
    }

    public get rootParent(): Promise<String> {
        return this.getRootParent().then(object => object.title);
    }

    public getParentsChain(): Promise<ILIASObject[]> {
        return this.parent.then(parentObject => {
            if (!parentObject) {
                return <Promise<ILIASObject[]>> Promise.resolve([this]);
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
    public getParentsTitleChain(): Promise<string[]> {
        return this.getParentsChain()
            .then(items => items.map((item) => item.title));
    }

    /**
     * Returns the objects parent or null, if no parent is available
     * @returns {Promise<ILIASObject>}
     */
    public get parent(): Promise<ILIASObject> {
        return new Promise((resolve, reject) => {
            ILIASObject.findByRefId(this.parentRefId, this.userId).then(parentObject => {
                if (parentObject.id) {
                    resolve(parentObject);
                } else {
                    resolve(null);
                }
            });
        });
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
        let iliasObject = new ILIASObject(id);
        let promise = iliasObject.read().then(() => {
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
    public static findByRefId(refId: number, userId: number): Promise<ILIASObject> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query('SELECT * FROM objects WHERE refId = ? AND userId = ?', [refId, userId]))
            .then((response: any) => {
                if (response.rows.length == 0) {
                    let object = new ILIASObject();
                    object.userId = userId;
                    return Promise.resolve(object);
                } else if(response.rows.length == 1) {
                    return ILIASObject.find(response.rows.item(0).id);
                } else if(response.rows.length > 1) {
                    // We find and save the object
                    let object = null;
                    let objectPromise =  ILIASObject.find(response.rows.item(0).id)
                        .then(theObject => object = theObject);
                    let allPromises = [objectPromise];

                    // We destroy all overdue instances.
                    for (let i = 1; i < response.rows.length; i++) {
                        allPromises.push(ILIASObject.find(response.rows.item(i).id)
                            .then(object => object.destroy()));
                    }

                    // After finding and deletion we return the found object.
                    return Promise.all(allPromises)
                        .then(() => object);
                }
            });
    }

    /**
     * Get ILIAS objects under a given parentRefId
     * @param parentRefId
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    static findByParentRefId(parentRefId: number, userId: number): Promise<ILIASObject[]> {
        let sql = 'SELECT * FROM objects WHERE parentRefId = ? AND userId = ?';
        let parameters = [parentRefId, userId];
        return ILIASObject.queryDatabase(sql, parameters);

    }

    static findNewObjects(userId: number): Promise<ILIASObject[]> {
        let sql = 'SELECT * FROM objects WHERE userId = ? AND (isNew = ? OR isUpdated = ?)';
        let parameters = [userId, 1, 1];
        return ILIASObject.queryDatabase(sql, parameters);
    }

    protected static queryDatabase(sql: string, parameters: any[]): Promise<ILIASObject[]> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query(sql, parameters))
            .then((response: any) => {
                let promises = [];
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
    static findByParentRefIdRecursive(parentRefId: number, userId: number): Promise<ILIASObject[]> {
        let iliasObjects: ILIASObject[] = [];

        return ILIASObject.findByParentRefId(parentRefId, userId).then(children => {
            let childrenPromises: Promise<ILIASObject[]>[] = [];
            children.forEach(child => {
                iliasObjects.push(child);
                childrenPromises.push(ILIASObject.findByParentRefIdRecursive(child.refId, userId));
            });
            return Promise.all(childrenPromises);
        }).then(promiseResults => {
            promiseResults.forEach((list: ILIASObject[]) => {
                list.forEach(child => {
                    iliasObjects.push(child);
                });
            });
            return Promise.resolve(iliasObjects);
        });
    }

    /**
     * updates the needsDownload state depending on the object type recursivly. This object and every parent recursivly.
     * @returns {Promise<T>} returns a list of the changed objects
     */
    public updateNeedsDownload(childNeedsUpdate = null): Promise<ILIASObject[]> {
        Log.write(this, "recursive update needs download. going through: " + this.title);
        if (this.type == 'file') {
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
            return Promise.resolve();
            //we do not need to escalate. we don't even save :-)
        }
    }

    /**
     *
     * @returns {Promise<T>} return a list of all ILIASObjects touched.
     */
    protected saveAndEscalateNeedsDownload(newValue): Promise<ILIASObject[]> {
        if (newValue == this.needsDownload) {
            Log.write(this, "Needs download stays the same for " + this.title + ". No need for escalation.");
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

    /**
     * Find ILIAS objects by Object-IDs for the given user-ID
     * @param objIds
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    public static findByObjIds(objIds: Array<number>, userId: number): Promise<ILIASObject[]> {
        if (!objIds.length) {
            return Promise.resolve([]);
        }
        return SQLiteDatabaseService.instance().then(db =>
            { db.query('SELECT * FROM objects WHERE objId IN (?) AND userId = ?', [objIds.join(','), userId]).then((response: any) => {
                let iliasObjects = [];
                for (let i = 0; i < response.rows.length; i++) {
                    iliasObjects.push(ILIASObject.find(response.rows.item(0).id));
                }
                return Promise.all(iliasObjects);
            });
        });
    }

    static findByUserId(userId: number): Promise<ILIASObject[]> {
        let sql = 'SELECT * FROM objects WHERE userId = ?';
        let parameters = [userId];
        return ILIASObject.queryDatabase(sql, parameters);
    }

    /**
     * returns 0 for crs, 1 for grp, 2 for fold, 3 for file and 9999 for all the rest.
     * @returns {number}
     */
    public getOrderByType() {
        let a = this.order[this.type];
        return a ? a : 9999;
    }

    /**
     *
     * @param a ILIASObject
     * @param b ILIASObject
     * @returns {number}
     */
    public static compare(a, b) {
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
    public destroy(): Promise<any> {
        let promise = super.destroy();

        return promise;
    }
}
