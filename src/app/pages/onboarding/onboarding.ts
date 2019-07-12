/** angular */
import {Component, ViewChild} from "@angular/core";
import {ModalController} from "@ionic/angular";

@Component({
    templateUrl: "onboarding.html"
})
export class OnboardingPage {
    @ViewChild("slides") slides: any;
    slideOptions: any;

    constructor(public modalCtrl: ModalController) { }

    nextSlide(): void {
        this.slides.slideNext();
    }

    dismiss(): void {
        this.modalCtrl.dismiss({
            "dismissed": true
        });
    }
}
