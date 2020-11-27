/** angular */
import { Component, ViewChild } from "@angular/core";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { IonSlides, NavController } from "@ionic/angular";
@Component({
    templateUrl: "onboarding.html",
    styleUrls: ["./onboarding.scss"],
    host: {
        "(window:resize)": "onResize()"
    }
})
export class OnboardingPage {
    readonly appName: Promise<string>;
    @ViewChild(IonSlides, {"static": false})
    slides: IonSlides;

    constructor(
        private readonly navCtrl: NavController,
        appVersion: AppVersion,
    ) {
        this.appName = appVersion.getAppName();
    }

    onResize(): void {
        this.slides.options = {
            width: window.outerWidth
        }
    }

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
