/** angular */
import {Component, ViewChild} from "@angular/core";
import {ModalController, IonSlides} from "@ionic/angular";

@Component({
    templateUrl: "onboarding.html"
})
export class OnboardingPage {
    //@ts-ignore
    @ViewChild("slides")  slides: IonSlides;

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
