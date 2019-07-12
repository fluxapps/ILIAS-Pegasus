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
import { NavProvider } from "../providers/nav.provider";
import { ILIASObjectAction, ILIASObjectActionNoMessage } from "./object-action";
var ShowObjectListPageAction = /** @class */ (function (_super) {
    __extends(ShowObjectListPageAction, _super);
    function ShowObjectListPageAction(title, object) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.object = object;
        return _this;
    }
    ShowObjectListPageAction.prototype.execute = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            NavProvider.push("tabs/content", { parent: _this.object }).then(function () {
                resolve(new ILIASObjectActionNoMessage());
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    ShowObjectListPageAction.prototype.alert = function () {
        return undefined;
    };
    return ShowObjectListPageAction;
}(ILIASObjectAction));
export { ShowObjectListPageAction };
//# sourceMappingURL=show-object-list-page-action.js.map