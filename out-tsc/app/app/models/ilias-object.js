var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ActiveRecord, SQLiteConnector } from "./active-record";
import { FileData } from "./file-data";
/** services */
import { SQLiteDatabaseService } from "../services/database.service";
import { ILIASObjectPresenterFactory } from "../presenters/presenter-factory";
/** logging */
import { Log } from "../services/log.service";
var ILIASObject = /** @class */ (function (_super) {
    __extends(ILIASObject, _super);
    function ILIASObject(id) {
        if (id === void 0) { id = 0; }
        var _this = _super.call(this, id, new SQLiteConnector("objects", [
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
        ])) || this;
        _this.newSubItems = 0;
        _this.hasPageLayout = false;
        _this.hasTimeline = false;
        _this.permissionType = "";
        _this.order = {
            "crs": 1,
            "grp": 2,
            "fold": 3,
            "file": 4
        };
        return _this;
    }
    Object.defineProperty(ILIASObject, "OFFLINE_OWNER_USER", {
        // A nice technique to simulate class constants :) ILIASObject.OFFLINE_OWNER_USER => 'user'
        get: function () {
            return "user";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ILIASObject, "OFFLINE_OWNER_SYSTEM", {
        get: function () {
            return "system";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ILIASObject.prototype, "data", {
        /**
         * Returns additional data as object
         * @returns {object}
         */
        get: function () {
            if (this._data) {
                try {
                    return JSON.parse(this._data);
                }
                catch (e) {
                    return {};
                }
            }
            return {};
        },
        set: function (data) {
            if (typeof data === "string") {
                this._data = data;
            }
            else if (typeof data === "object" && data !== null) {
                this._data = JSON.stringify(data);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ILIASObject.prototype, "repoPath", {
        /**
         * Returns additional data as object
         * @returns {object}
         */
        get: function () {
            if (this._repoPath) {
                try {
                    return JSON.parse(this._repoPath);
                }
                catch (e) {
                    Log.error(this, "Could not get json from: " + this._repoPath);
                    return [];
                }
            }
            return [];
        },
        set: function (path) {
            if (typeof path === "string") {
                this._repoPath = path;
            }
            else if (path !== null) {
                this._repoPath = JSON.stringify(path);
            }
            else if (path === null) {
                this._repoPath = null;
            }
            else {
                Log.describe(this, "repo path is: ", path);
                throw new Error("Please provide a string or a list of strings for repoPath in ilias-object.ts");
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @returns {boolean}
     */
    ILIASObject.prototype.isContainer = function () {
        return (["crs", "grp", "fold"].indexOf(this.type) > -1);
    };
    ILIASObject.prototype.isFile = function () {
        return this.type == "file";
    };
    /**
     * @returns {boolean} true if the object has permission visible, otherwise false
     */
    ILIASObject.prototype.isLinked = function () {
        return this.permissionType == "visible";
    };
    ILIASObject.prototype.isLearnplace = function () {
        return this.type == "xsrl";
    };
    Object.defineProperty(ILIASObject.prototype, "presenter", {
        /**
         * @returns {ILIASObjectPresenter}
         */
        get: function () {
            if (!this._presenter) {
                this._presenter = ILIASObjectPresenterFactory.instance(this);
            }
            return this._presenter;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the root parent, e.g. the top container (course or group) or null
     */
    ILIASObject.prototype.getRootParent = function () {
        return this.getParentsChain()
            .then(function (chain) { return Promise.resolve(chain[0]); });
    };
    Object.defineProperty(ILIASObject.prototype, "rootParent", {
        get: function () {
            return this.getRootParent().then(function (object) { return object.title; });
        },
        enumerable: true,
        configurable: true
    });
    ILIASObject.prototype.getParentsChain = function () {
        var _this = this;
        return this.parent.then(function (parentObject) {
            if (!parentObject) {
                return Promise.resolve([_this]);
            }
            else {
                return parentObject.getParentsChain()
                    .then(function (chain) {
                    chain.push(_this);
                    return Promise.resolve(chain);
                });
            }
        });
    };
    /**
     *
     * @returns {Promise<string>}
     */
    ILIASObject.prototype.getParentsTitleChain = function () {
        return this.getParentsChain()
            .then(function (items) { return items.map(function (item) { return item.title; }); });
    };
    Object.defineProperty(ILIASObject.prototype, "parent", {
        /**
         * Returns the objects parent or null, if no parent is available
         * @returns {Promise<ILIASObject>}
         */
        get: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                ILIASObject.findByRefId(_this.parentRefId, _this.userId).then(function (parentObject) {
                    if (parentObject.id) {
                        resolve(parentObject);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Checks whether the object is contained within a favorite-object
     */
    ILIASObject.prototype.objectIsUnderFavorite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var parents, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getParentsChain()];
                    case 1:
                        parents = _a.sent();
                        for (i = 0; i < parents.length; i++)
                            if (parents[i].isFavorite)
                                return [2 /*return*/, true];
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Find ILIAS-Object by primary ID, returns a Promise resolving the fully loaded ILIASObject object
     * @param id
     * @returns {Promise<ILIASObject>}
     */
    ILIASObject.find = function (id) {
        // If we already have the object, just return it.
        if (ILIASObject.objectsCache[id]) {
            return Promise.resolve(ILIASObject.objectsCache[id]);
        }
        //if the object is currently loading.
        if (ILIASObject.promiseCache[id]) {
            return new Promise(function (resolve, reject) {
                ILIASObject.promiseCache[id].then(function () {
                    resolve(ILIASObject.objectsCache[id]);
                });
            });
        }
        //if the object needs to be loaded
        var iliasObject = new ILIASObject(id);
        var promise = iliasObject.read().then(function () {
            //save the object into cache
            ILIASObject.objectsCache[id] = iliasObject;
            //we are no longer loading the object.
            delete ILIASObject.promiseCache[id];
            return Promise.resolve(iliasObject);
        });
        //we save the promise so that we are aware that we are currently loading this object.
        ILIASObject.promiseCache[id] = promise;
        return promise;
    };
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
    ILIASObject.findByRefId = function (refId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, response, object, object, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SQLiteDatabaseService.instance()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.query("SELECT * FROM objects WHERE refId = ? AND userId = ?", [refId, userId])];
                    case 2:
                        response = _a.sent();
                        if (!(response.rows.length == 0)) return [3 /*break*/, 3];
                        object = new ILIASObject();
                        object.userId = userId;
                        return [2 /*return*/, Promise.resolve(object)];
                    case 3:
                        if (!(response.rows.length == 1)) return [3 /*break*/, 4];
                        return [2 /*return*/, ILIASObject.find(response.rows.item(0).id)];
                    case 4:
                        if (!(response.rows.length > 1)) return [3 /*break*/, 10];
                        return [4 /*yield*/, ILIASObject.find(response.rows.item(0).id)];
                    case 5:
                        object = _a.sent();
                        i = 1;
                        _a.label = 6;
                    case 6:
                        if (!(i < response.rows.length)) return [3 /*break*/, 9];
                        return [4 /*yield*/, ILIASObject.find(response.rows.item(i).id)];
                    case 7:
                        (_a.sent()).destroy();
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: 
                    // After finding and deletion we return the found object.
                    return [2 /*return*/, object];
                    case 10: return [2 /*return*/, new ILIASObject()];
                }
            });
        });
    };
    /**
     * Get ILIAS objects under a given parentRefId
     * @param parentRefId
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    ILIASObject.findByParentRefId = function (parentRefId, userId) {
        var sql = "SELECT * FROM objects WHERE parentRefId = ? AND userId = ?";
        var parameters = [parentRefId, userId];
        return ILIASObject.queryDatabase(sql, parameters);
    };
    ILIASObject.findNewObjects = function (userId) {
        var sql = "SELECT * FROM objects WHERE userId = ? AND (isNew = ? OR isUpdated = ?)";
        var parameters = [userId, 1, 1];
        return ILIASObject.queryDatabase(sql, parameters);
    };
    ILIASObject.queryDatabase = function (sql, parameters) {
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query(sql, parameters); })
            .then(function (response) {
            var promises = [];
            for (var i = 0; i < response.rows.length; i++) {
                promises.push(ILIASObject.find(response.rows.item(i).id));
            }
            return Promise.all(promises);
        });
    };
    /**
     * Get ILIAS objects under a given parentRefId, recursive!
     * @param parentRefId
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    ILIASObject.findByParentRefIdRecursive = function (parentRefId, userId) {
        var iliasObjects = [];
        return ILIASObject.findByParentRefId(parentRefId, userId).then(function (children) {
            var childrenPromises = [];
            children.forEach(function (child) {
                iliasObjects.push(child);
                childrenPromises.push(ILIASObject.findByParentRefIdRecursive(child.refId, userId));
            });
            return Promise.all(childrenPromises);
        }).then(function (promiseResults) {
            promiseResults.forEach(function (list) {
                list.forEach(function (child) {
                    iliasObjects.push(child);
                });
            });
            return Promise.resolve(iliasObjects);
        });
    };
    /**
     * removes the offline-data, sets the isOfflineAvailable-flags accordingly and sets isFavorite to false
     */
    ILIASObject.prototype.removeFromFavorites = function (fileService) {
        return __awaiter(this, void 0, void 0, function () {
            var underFavorite, objectsStack, ilObj, newObjects, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setIsFavorite(0)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.objectIsUnderFavorite()];
                    case 2:
                        underFavorite = _a.sent();
                        objectsStack = underFavorite ? [] : [this];
                        _a.label = 3;
                    case 3:
                        if (!objectsStack.length) return [3 /*break*/, 6];
                        ilObj = objectsStack.pop();
                        return [4 /*yield*/, ILIASObject.findByParentRefId(ilObj.refId, this.userId)];
                    case 4:
                        newObjects = _a.sent();
                        for (i = 0; i < newObjects.length; i++)
                            if (!newObjects[i].isFavorite)
                                objectsStack.push(newObjects[i]);
                        return [4 /*yield*/, fileService.removeObject(ilObj)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set property 'isFavorite' of the 'iliasObject'
     */
    ILIASObject.prototype.setIsFavorite = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isFavorite = value;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set property 'isOfflineAvailable' of the 'iliasObject' and its content to 'value'
     */
    ILIASObject.setOfflineAvailableRecursive = function (iliasObject, user, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ILIASObject.findByParentRefIdRecursive(iliasObject.refId, user.id).then(function (objects) {
                    objects.push(iliasObject);
                    objects.forEach(function (o) {
                        o.isOfflineAvailable = value;
                        if (value)
                            o.offlineAvailableOwner = undefined; // TODO sync how to set this value
                        o.save();
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * updates the needsDownload state depending on the object type recursivly. This object and every parent recursively.
     * @returns {Promise<T>} returns a list of the changed objects
     */
    ILIASObject.prototype.updateNeedsDownload = function (childNeedsUpdate) {
        var _this = this;
        if (childNeedsUpdate === void 0) { childNeedsUpdate = null; }
        Log.write(this, "recursive update needs download. going through: " + this.title);
        if (this.type == "file") {
            // A file needs to check its file state and then escalate.
            return FileData.find(this.id).then(function (fileData) {
                if (_this.id && fileData.isUpdated())
                    _this.isUpdated = true;
                return _this.saveAndEscalateNeedsDownload(fileData.needsDownload());
            });
        }
        else if (this.isContainer()) {
            //performance improvmente, if a child needs update we certainly need to update too.
            if (childNeedsUpdate !== null && childNeedsUpdate)
                return this.saveAndEscalateNeedsDownload(true);
            // A container needs to check all its children.
            return ILIASObject.findByParentRefId(this.refId, this.userId).then(function (objects) {
                objects = objects.filter(function (object) {
                    return object.needsDownload == true;
                });
                return _this.saveAndEscalateNeedsDownload((objects.length > 0));
            });
        }
        else {
            this.needsDownload = false;
            return Promise.resolve([]);
            //we do not need to escalate. we don't even save :-)
        }
    };
    /**
     *
     * @returns {Promise<T>} return a list of all ILIASObjects touched.
     */
    ILIASObject.prototype.saveAndEscalateNeedsDownload = function (newValue) {
        var _this = this;
        if (newValue == this.needsDownload) {
            Log.write(this, "Needs download stays the same for " + this.title + ". No need for escalation.");
            return Promise.resolve([this]);
        }
        this.needsDownload = newValue;
        return this.save()
            .then(function () { return _this.parent; })
            .then(function (parent) {
            if (parent) {
                return parent.updateNeedsDownload(_this.needsDownload)
                    .then(function (objects) {
                    objects.push(_this);
                    return Promise.resolve(objects);
                });
            }
            else {
                return Promise.resolve([_this]);
            }
        });
    };
    ILIASObject.findByUserId = function (userId) {
        var sql = "SELECT * FROM objects WHERE userId = ?";
        var parameters = [userId];
        return ILIASObject.queryDatabase(sql, parameters);
    };
    /**
     * returns 0 for crs, 1 for grp, 2 for fold, 3 for file and 9999 for all the rest.
     * @returns {number}
     */
    ILIASObject.prototype.getOrderByType = function () {
        var lastPlace = 9999;
        var a = this.order[this.type];
        return a ? a : lastPlace;
    };
    /**
     *
     * @param a ILIASObject
     * @param b ILIASObject
     * @returns {number}
     */
    ILIASObject.compare = function (a, b) {
        if (a.getOrderByType() != b.getOrderByType()) {
            return (a.getOrderByType() > b.getOrderByType()) ? 1 : -1;
        }
        if (a.type != b.type) {
            return (a.type > b.type) ? 1 : -1;
        }
        if (a.title == b.title)
            return 0;
        return (a.title > b.title) ? 1 : -1;
    };
    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    ILIASObject.prototype.destroy = function () {
        return _super.prototype.destroy.call(this);
    };
    ILIASObject.objectsCache = {};
    ILIASObject.promiseCache = {};
    return ILIASObject;
}(ActiveRecord));
export { ILIASObject };
//# sourceMappingURL=ilias-object.js.map