var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { NewsEntity } from "./news.entity";
var UserEntity = /** @class */ (function () {
    function UserEntity() {
    }
    __decorate([
        PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], UserEntity.prototype, "id", void 0);
    __decorate([
        Column(),
        __metadata("design:type", Number)
    ], UserEntity.prototype, "iliasUserId", void 0);
    __decorate([
        Column(),
        __metadata("design:type", String)
    ], UserEntity.prototype, "iliasLogin", void 0);
    __decorate([
        Column(),
        __metadata("design:type", Number)
    ], UserEntity.prototype, "installationId", void 0);
    __decorate([
        Column(),
        __metadata("design:type", String)
    ], UserEntity.prototype, "accessToken", void 0);
    __decorate([
        Column(),
        __metadata("design:type", String)
    ], UserEntity.prototype, "refreshToken", void 0);
    __decorate([
        Column(),
        __metadata("design:type", Number)
    ], UserEntity.prototype, "lastTokenUpdate", void 0);
    __decorate([
        ManyToMany(function (type) { return NewsEntity; }, {
            cascadeInsert: true,
            cascadeUpdate: true,
            eager: true
        }),
        JoinTable({
            name: "users_news",
            joinColumn: {
                name: "usersId",
                referencedColumnName: "id"
            },
            inverseJoinColumn: {
                name: "newsId",
                referencedColumnName: "newsId"
            }
        }),
        __metadata("design:type", Array)
    ], UserEntity.prototype, "news", void 0);
    UserEntity = __decorate([
        Entity("users")
    ], UserEntity);
    return UserEntity;
}());
export { UserEntity };
//# sourceMappingURL=user.entity.js.map