var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/** angular */
import { Component } from "@angular/core";
/** ionic-native */
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
/*
  Generated class for the InfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var InfoPage = /** @class */ (function () {
    function InfoPage(browser) {
        this.browser = browser;
        this.tab = "info";
    }
    // call(number) {
    //   (<any> window).location = number;
    // }
    InfoPage.prototype.browse = function (page) {
        this.browser.create(page, "_system");
    };
    InfoPage = __decorate([
        Component({
            selector: "page-info",
            templateUrl: "info.html",
        }),
        __metadata("design:paramtypes", [InAppBrowser])
    ], InfoPage);
    return InfoPage;
}());
export { InfoPage };
//# sourceMappingURL=info.js.map