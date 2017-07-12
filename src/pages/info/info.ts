import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {InAppBrowser} from "ionic-native";

/*
  Generated class for the InfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'info.html'
})
export class InfoPage {

  public tab:string = 'info';

  constructor(public nav: NavController) {}

  public call(number) {
    (<any> window).location = number;
  }

  public browse(page) {
    new InAppBrowser(page, '_system');
  }
}
