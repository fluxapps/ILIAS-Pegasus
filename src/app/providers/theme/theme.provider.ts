import {Injectable} from "@angular/core";
import {IconProvider} from "./icon.provider";

@Injectable({
    providedIn: "root"
})
export class ThemeProvider {

    constructor(
        private readonly iconProvider: IconProvider,
    ) {}


}
