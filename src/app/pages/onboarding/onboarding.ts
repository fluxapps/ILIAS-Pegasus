/** angular */
import { Component, ViewChild } from "@angular/core";
import { IonSlides, NavController } from "@ionic/angular";

@Component({
    templateUrl: "onboarding.html",
    styleUrls: ["./onboarding.scss"]
})
export class OnboardingPage {

    @ViewChild(IonSlides, {"static": false})
    slides: IonSlides;

    constructor(
        private readonly navCtrl: NavController,
    ) { }

    async nextSlide(): Promise<void> {
        const isEnd: boolean = await this.slides.isEnd();
        if (isEnd) {
            this.dismiss();
            return;
        }

        await this.slides.slideNext(300);
    }

    dismiss(): void {
        this.navCtrl.navigateRoot(["/login"]);
    }
}
