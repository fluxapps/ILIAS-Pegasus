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
import { MigrationVersion } from "../services/migration/migration.api";
import { Table, TableColumn, TableForeignKey } from "typeorm";
/**
 * Migration for Lernorte 2.0.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.6
 */
var CreateLearnplace = /** @class */ (function () {
    function CreateLearnplace() {
        this.version = new MigrationVersion("V__3");
    }
    CreateLearnplace.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var learnplace, visitJournal, visibility, location, map, accordion, learnplaceAccordionJunction, textBlock, learnplaceTextblockJunction, accordionTextblockJunction, pictureBlock, learnplacePictureblockJunction, accordionPictureblockJunction, linkBlock, learnplaceLinkblockJunction, accordionLinkblockJunction, videoBlock, learnplaceVideoblockJunction, accordionVideoblockJunction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        learnplace = new Table("Learnplace", [
                            new TableColumn({ name: "id", type: "string", length: "38", isPrimary: true, isNullable: false }),
                            new TableColumn({ name: "objectId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "FK_user", type: "integer", isNullable: false })
                        ]);
                        visitJournal = new Table("VisitJournal", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isGenerated: true, isNullable: false }),
                            new TableColumn({ name: "userId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "time", type: "integer", isNullable: false }),
                            new TableColumn({ name: "synchronized", type: "boolean", isNullable: false }),
                            new TableColumn({ name: "FK_learnplace", type: "string", length: "38", isNullable: false })
                        ]);
                        visibility = new Table("Visibility", [
                            new TableColumn({ name: "value", type: "string", length: "128", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        location = new Table("Location", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isGenerated: true, isNullable: false }),
                            new TableColumn({ name: "latitude", type: "double", isNullable: false }),
                            new TableColumn({ name: "longitude", type: "double", isNullable: false }),
                            new TableColumn({ name: "elevation", type: "double", isNullable: false }),
                            new TableColumn({ name: "radius", type: "integer", isNullable: false }),
                            new TableColumn({ name: "FK_learnplace", type: "string", length: "38", isNullable: false })
                        ]);
                        map = new Table("Map", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true }),
                            new TableColumn({ name: "zoom", type: "integer", isNullable: false }),
                            new TableColumn({ name: "FK_visibility", type: "string", length: "128", isNullable: false }),
                            new TableColumn({ name: "FK_learnplace", type: "string", length: "38", isNullable: false })
                        ]);
                        accordion = new Table("Accordion", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true }),
                            new TableColumn({ name: "iliasId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "sequence", type: "integer", isNullable: false }),
                            new TableColumn({ name: "title", type: "string", length: "256", isNullable: false }),
                            new TableColumn({ name: "expanded", type: "boolean", isNullable: false }),
                            new TableColumn({ name: "FK_visibility", type: "string", length: "128", isNullable: false })
                        ]);
                        learnplaceAccordionJunction = new Table("learnplace_accordion", [
                            new TableColumn({ name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        textBlock = new Table("TextBlock", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true }),
                            new TableColumn({ name: "iliasId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "content", type: "string", length: "5000", isNullable: false }),
                            new TableColumn({ name: "sequence", type: "integer", isNullable: false }),
                            new TableColumn({ name: "FK_visibility", type: "string", length: "128", isNullable: false })
                        ]);
                        learnplaceTextblockJunction = new Table("learnplace_textblock", [
                            new TableColumn({ name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "textblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        accordionTextblockJunction = new Table("accordion_textblock", [
                            new TableColumn({ name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "textblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        pictureBlock = new Table("PictureBlock", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true }),
                            new TableColumn({ name: "iliasId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "sequence", type: "integer", isNullable: false }),
                            new TableColumn({ name: "title", type: "string", length: "256", isNullable: false }),
                            new TableColumn({ name: "description", type: "string", length: "2000", isNullable: false }),
                            new TableColumn({ name: "thumbnail", type: "string", length: "256", isNullable: false }),
                            new TableColumn({ name: "thumbnailHash", type: "string", length: "64", isNullable: false }),
                            new TableColumn({ name: "url", type: "string", length: "256", isNullable: false }),
                            new TableColumn({ name: "hash", type: "string", length: "64", isNullable: false }),
                            new TableColumn({ name: "FK_visibility", type: "string", length: "128", isNullable: false })
                        ]);
                        learnplacePictureblockJunction = new Table("learnplace_pictureblock", [
                            new TableColumn({ name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "pictureblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        accordionPictureblockJunction = new Table("accordion_pictureblock", [
                            new TableColumn({ name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "pictureblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        linkBlock = new Table("LinkBlock", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true }),
                            new TableColumn({ name: "iliasId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "sequence", type: "integer", isNullable: false }),
                            new TableColumn({ name: "refId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "FK_visibility", type: "string", length: "128", isNullable: false })
                        ]);
                        learnplaceLinkblockJunction = new Table("learnplace_linkblock", [
                            new TableColumn({ name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "linkblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        accordionLinkblockJunction = new Table("accordion_linkblock", [
                            new TableColumn({ name: "accordionId", type: "integer", length: "38", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "linkblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        videoBlock = new Table("VideoBlock", [
                            new TableColumn({ name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true }),
                            new TableColumn({ name: "iliasId", type: "integer", isNullable: false }),
                            new TableColumn({ name: "sequence", type: "integer", isNullable: false }),
                            new TableColumn({ name: "url", type: "string", length: "256", isNullable: false }),
                            new TableColumn({ name: "hash", type: "string", length: "64", isNullable: false }),
                            new TableColumn({ name: "FK_visibility", type: "string", length: "128", isNullable: false })
                        ]);
                        learnplaceVideoblockJunction = new Table("learnplace_videoblock", [
                            new TableColumn({ name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "videoblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        accordionVideoblockJunction = new Table("accordion_videoblock", [
                            new TableColumn({ name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false }),
                            new TableColumn({ name: "videoblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false })
                        ]);
                        return [4 /*yield*/, queryRunner.createTable(learnplace)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(visitJournal)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(visibility)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(location)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(map)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(accordion)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(learnplaceAccordionJunction)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(textBlock)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(learnplaceTextblockJunction)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(accordionTextblockJunction)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(pictureBlock)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(learnplacePictureblockJunction)];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(accordionPictureblockJunction)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(linkBlock)];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(learnplaceLinkblockJunction)];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(accordionLinkblockJunction)];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(videoBlock)];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(learnplaceVideoblockJunction)];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createTable(accordionVideoblockJunction)];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.insert("Visibility", { value: "ALWAYS" })];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.insert("Visibility", { value: "NEVER" })];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.insert("Visibility", { value: "ONLY_AT_PLACE" })];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.insert("Visibility", { value: "AFTER_VISIT_PLACE" })];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(visitJournal, new TableForeignKey("visitJournal_FK_learnplace_learnplace_id", ["FK_learnplace"], ["id"], learnplace.name, "", "CASCADE"))];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(location, new TableForeignKey("location_FK_learnplace_learnplace_id", ["FK_learnplace"], ["id"], learnplace.name, "", "CASCADE"))];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(learnplaceAccordionJunction, [
                                new TableForeignKey("accordion_learnplace_junc", ["learnplaceId"], ["id"], learnplace.name, "", "CASCADE"),
                                new TableForeignKey("learnplace_accordion_junc", ["accordionId"], ["id"], accordion.name, "", "CASCADE")
                            ])];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(learnplaceTextblockJunction, [
                                new TableForeignKey("textblock_learnplace_junc", ["learnplaceId"], ["id"], learnplace.name, "", "CASCADE"),
                                new TableForeignKey("learnplace_textblock_junc", ["textblockId"], ["id"], textBlock.name, "", "CASCADE")
                            ])];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(learnplacePictureblockJunction, [
                                new TableForeignKey("pictureblock_learnplace_junc", ["learnplaceId"], ["id"], learnplace.name, "", "CASCADE"),
                                new TableForeignKey("learnplace_pictureblock_junc", ["pictureblockId"], ["id"], pictureBlock.name, "", "CASCADE")
                            ])];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(learnplaceLinkblockJunction, [
                                new TableForeignKey("linkblock_learnplace_junc", ["learnplaceId"], ["id"], learnplace.name, "", "CASCADE"),
                                new TableForeignKey("learnplace_linkblock_junc", ["linkblockId"], ["id"], linkBlock.name, "", "CASCADE")
                            ])];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(learnplaceVideoblockJunction, [
                                new TableForeignKey("videoblock_learnplace_junc", ["learnplaceId"], ["id"], learnplace.name, "", "CASCADE"),
                                new TableForeignKey("learnplace_videoblock_junc", ["videoblockId"], ["id"], videoBlock.name, "", "CASCADE")
                            ])];
                    case 30:
                        _a.sent();
                        //------- accordion junc -------------
                        return [4 /*yield*/, queryRunner.createForeignKeys(accordionTextblockJunction, [
                                new TableForeignKey("textblock_accordion_junc", ["accordionId"], ["id"], accordion.name, "", "CASCADE"),
                                new TableForeignKey("accordion_textblock_junc", ["textblockId"], ["id"], textBlock.name, "", "CASCADE")
                            ])];
                    case 31:
                        //------- accordion junc -------------
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(accordionPictureblockJunction, [
                                new TableForeignKey("pictureblock_accordion_junc", ["accordionId"], ["id"], accordion.name, "", "CASCADE"),
                                new TableForeignKey("accordion_pictureblock_junc", ["pictureblockId"], ["id"], pictureBlock.name, "", "CASCADE")
                            ])];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(accordionLinkblockJunction, [
                                new TableForeignKey("linkblock_accordion_junc", ["accordionId"], ["id"], accordion.name, "", "CASCADE"),
                                new TableForeignKey("accordion_linkblock_junc", ["linkblockId"], ["id"], linkBlock.name, "", "CASCADE")
                            ])];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(accordionVideoblockJunction, [
                                new TableForeignKey("videoblock_accordion_junc", ["accordionId"], ["id"], accordion.name, "", "CASCADE"),
                                new TableForeignKey("accordion_videoblock_junc", ["videoblockId"], ["id"], videoBlock.name, "", "CASCADE")
                            ])];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKeys(map, [
                                new TableForeignKey("map_visibility", ["FK_visibility"], ["value"], visibility.name, "", "RESTRICT"),
                                new TableForeignKey("map_FK_learnplace_learnplace_id", ["FK_learnplace"], ["id"], learnplace.name, "", "CASCADE")
                            ])];
                    case 35: 
                    // -------------- visibility ----------------
                    //only one create foreign key per table works ...
                    return [4 /*yield*/, _a.sent()];
                    case 36:
                        // -------------- visibility ----------------
                        //only one create foreign key per table works ...
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(textBlock, new TableForeignKey("textblock_visibility", ["FK_visibility"], ["value"], visibility.name, "", "RESTRICT"))];
                    case 37: return [4 /*yield*/, _a.sent()];
                    case 38:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(accordion, new TableForeignKey("accordion_visibility", ["FK_visibility"], ["value"], visibility.name, "", "RESTRICT"))];
                    case 39: return [4 /*yield*/, _a.sent()];
                    case 40:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(pictureBlock, new TableForeignKey("pictureblock_visibility", ["FK_visibility"], ["value"], visibility.name, "", "RESTRICT"))];
                    case 41: return [4 /*yield*/, _a.sent()];
                    case 42:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(linkBlock, new TableForeignKey("link_visibility", ["FK_visibility"], ["value"], visibility.name, "", "RESTRICT"))];
                    case 43: return [4 /*yield*/, _a.sent()];
                    case 44:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.createForeignKey(videoBlock, new TableForeignKey("videoblock_visibility", ["FK_visibility"], ["value"], visibility.name, "", "RESTRICT"))];
                    case 45: return [4 /*yield*/, _a.sent()];
                    case 46:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLearnplace.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.dropTable("Map")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("Location")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("Visibility")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("TextBlock")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("learnplace_textblock")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("accordion_textblock")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("PictureBlock")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("learnplace_pictureblock")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("accordion_pictureblock")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("LinkBLock")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("learnplace_linkblock")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("accordion_linkblock")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("VideoBlock")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("learnplace_videoblock")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("accordion_videoblock")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("Accordion")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("learnplace_accordion")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("VisitJournal")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.dropTable("Learnplace")];
                    case 19:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return CreateLearnplace;
}());
export { CreateLearnplace };
//# sourceMappingURL=V__3-create-learnplace-shema.js.map