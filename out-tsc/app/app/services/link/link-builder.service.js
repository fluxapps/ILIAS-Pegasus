var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/** angular */
import { Inject, Injectable, InjectionToken } from "@angular/core";
/** builders */
import { DEFAULT_LINK_BUILDER } from "./default.builder";
import { TIMELINE_LINK_BUILDER } from "./timeline.builder";
import { NEWS_LINK_BUILDER } from "./news.builder";
import { LOGIN_LINK_BUILDER } from "./login.builder";
import { LOADING_LINK_BUILDER } from "./loading.builder";
import { RESOURCE_LINK_BUILDER } from "./resource.builder";
export var LINK_BUILDER = new InjectionToken("token for loading link builder");
var LinkBuilderImpl = /** @class */ (function () {
    function LinkBuilderImpl(defaultLinkBuilder, timelineLinkBuilder, newsLinkBuilder, loginLinkBuilder, loadingLinkBuilder, resourceLinkBuilder) {
        this.defaultLinkBuilder = defaultLinkBuilder;
        this.timelineLinkBuilder = timelineLinkBuilder;
        this.newsLinkBuilder = newsLinkBuilder;
        this.loginLinkBuilder = loginLinkBuilder;
        this.loadingLinkBuilder = loadingLinkBuilder;
        this.resourceLinkBuilder = resourceLinkBuilder;
    }
    LinkBuilderImpl.prototype.default = function () {
        return this.defaultLinkBuilder();
    };
    LinkBuilderImpl.prototype.timeline = function () {
        return this.timelineLinkBuilder();
    };
    LinkBuilderImpl.prototype.news = function () {
        return this.newsLinkBuilder();
    };
    LinkBuilderImpl.prototype.loadingPage = function () {
        return this.loadingLinkBuilder();
    };
    LinkBuilderImpl.prototype.loginPage = function () {
        return this.loginLinkBuilder();
    };
    LinkBuilderImpl.prototype.resource = function () {
        return this.resourceLinkBuilder();
    };
    LinkBuilderImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(DEFAULT_LINK_BUILDER)),
        __param(1, Inject(TIMELINE_LINK_BUILDER)),
        __param(2, Inject(NEWS_LINK_BUILDER)),
        __param(3, Inject(LOGIN_LINK_BUILDER)),
        __param(4, Inject(LOADING_LINK_BUILDER)),
        __param(5, Inject(RESOURCE_LINK_BUILDER)),
        __metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function])
    ], LinkBuilderImpl);
    return LinkBuilderImpl;
}());
export { LinkBuilderImpl };
//# sourceMappingURL=link-builder.service.js.map