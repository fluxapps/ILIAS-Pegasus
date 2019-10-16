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

    ionViewDidLoad(): void{
    }

    nextSlide(): void {
        
        console.log("FIRRED")
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
        this.modalCtrl.dismiss({
            "dismissed": true
        });
    }

    slideChanged(): void { 
        console.log("FIRRED")
        this.slides.getActiveIndex().then(index => {
           console.log(index);
        });
    }
}
