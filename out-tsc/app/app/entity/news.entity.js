var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, PrimaryColumn } from "typeorm";
var NewsEntity = /** @class */ (function () {
    function NewsEntity() {
    }
    __decorate([
        PrimaryColumn(),
        __metadata("design:type", Number)
    ], NewsEntity.prototype, "newsId", void 0);
    __decorate([
        Column(),
        __metadata("design:type", Number)
    ], NewsEntity.prototype, "newsContext", void 0);
    __decorate([
        Column(),
        __metadata("design:type", String)
    ], NewsEntity.prototype, "title", void 0);
    __decorate([
        Column(),
        __metadata("design:type", String)
    ], NewsEntity.prototype, "subtitle", void 0);
    __decorate([
        Column(),
        __metadata("design:type", String)
    ], NewsEntity.prototype, "content", void 0);
    __decorate([
        Column(),
        __metadata("design:type", Number)
    ], NewsEntity.prototype, "createDate", void 0);
    __decorate([
        Column(),
        __metadata("design:type", Number)
    ], NewsEntity.prototype, "updateDate", void 0);
    NewsEntity = __decorate([
        Entity("News")
    ], NewsEntity);
    return NewsEntity;
}());
export { NewsEntity };
//# sourceMappingURL=news.entity.js.map