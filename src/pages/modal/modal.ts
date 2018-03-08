import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";

@Component({
    templateUrl: "modal.html",
})
export class ModalPage {

    title = "";

    text = "";

    /**
     * @param params
     */
    constructor(public params: NavParams) {
        this.text = params.get("text");
        this.title = params.get("title");
    }


    ngAfterViewInit() {
    }
}
