/** angular */
import {Component, ViewChild} from "@angular/core";
import { ModalController, IonSlides, NavController } from "@ionic/angular";

@Component({
    templateUrl: "onboarding.html"
})
export class OnboardingPage {

    @ViewChild(IonSlides, {"static": false})
    slides: IonSlides;

    constructor(
        public modalCtrl: ModalController,
        private readonly navCtrl: NavController,
    ) { }

    nextSlide(): void {
        this.slides.getActiveIndex().then(index => {
            console.log(index);
            if (index == 2){
                this.dismiss()
            } else {
                this.slides.slideNext(300);
            }
         });
    }

    dismiss(): void {
        this.navCtrl.navigateRoot(["/login"]);
    }

    slideChanged(): void {
        this.slides.getActiveIndex().then(index => {
           console.log(index);
        });
    }
}
