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
import { ILIASObjectAction } from "./object-action";
var ShowDetailsPageAction = /** @class */ (function (_super) {
    __extends(ShowDetailsPageAction, _super);
    function ShowDetailsPageAction(title, object, nav) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.object = object;
        _this.nav = nav;
        return _this;
    }
    ShowDetailsPageAction.prototype.execute = function () {
        return new Promise(function (resolve, reject) {
            /* TODO migration this.nav.push(ObjectDetailsPage, {object: this.object}).then(() => {
                resolve(new ILIASObjectActionNoMessage());
            }).catch(error =>{
                reject(error);
            });*/
        });
    };
    ShowDetailsPageAction.prototype.alert = function () {
        return undefined;
    };
    return ShowDetailsPageAction;
}(ILIASObjectAction));
export { ShowDetailsPageAction };
//# sourceMappingURL=show-details-page-action.js.map