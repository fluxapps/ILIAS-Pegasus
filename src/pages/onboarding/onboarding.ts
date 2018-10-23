import {Component, ViewChild} from "@angular/core";
import {NavController, ViewController} from "ionic-angular";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {ThemeProvider} from "../../providers/theme";

/*
  Generated class for the InfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: "onboarding.html"
})
export class OnboardingPage {
  
  @ViewChild('slides') slides: any;

  slideOptions: any;

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    private readonly theme: ThemeProvider
  ) {

  }
  
  nextSlide(){
    this.slides.slideNext();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
