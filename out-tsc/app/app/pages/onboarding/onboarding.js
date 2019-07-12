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
import { Component, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";
var OnboardingPage = /** @class */ (function () {
    function OnboardingPage(modalCtrl) {
        this.modalCtrl = modalCtrl;
    }
    OnboardingPage.prototype.nextSlide = function () {
        this.slides.slideNext();
    };
    OnboardingPage.prototype.dismiss = function () {
        this.modalCtrl.dismiss({
            "dismissed": true
        });
    };
    __decorate([
        ViewChild("slides"),
        __metadata("design:type", Object)
    ], OnboardingPage.prototype, "slides", void 0);
    OnboardingPage = __decorate([
        Component({
            templateUrl: "onboarding.html"
        }),
        __metadata("design:paramtypes", [ModalController])
    ], OnboardingPage);
    return OnboardingPage;
}());
export { OnboardingPage };
//# sourceMappingURL=onboarding.js.map