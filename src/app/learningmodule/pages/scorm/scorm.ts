import {Component, Inject} from "@angular/core";

@Component({
    selector: "page-scorm",
    templateUrl: "scorm.html",
})
export class ScormPage {

    private sourceRoot: string = "assets/scorm/player/";

    constructor() {}

    async ionViewDidEnter(): Promise<void> {
        const scripts: Array<string> = [
            "scormpool/Lib/sscompat.js",
            "scormpool/Lib/sscorlib.js",
            "scormpool/Lib/ssfx.Core.js",
            "scormpool/Lib/API_BASE.js",
            "scormpool/Lib/API.js",
            "scormpool/Lib/API_1484_11.js",
            "scormpool/Lib/Controls.js",
            "scormpool/Lib/LocalStorage.js",
            "scormpool/Lib/Player.js",
            "style.css",
            "init.js"
        ];

        let cnt: number = 0;
        scripts.forEach(src => {
            cnt++;
            setTimeout(() => {
                console.log(`loading file '${src}'`);

                src = `${this.sourceRoot}${src}`;
                let element: HTMLScriptElement | HTMLLinkElement;
                const extension: string = src.split(".").pop();
                switch (extension) {
                    case "js":
                        element = document.createElement("script");
                        element.src = src;
                        break;
                    case("css"):
                        element = document.createElement("link");
                        element.type = "text/css";
                        element.href = src;
                        break;
                    default:
                        console.warn(`extension '${extension}' not supported of file '${src}'`);
                        return;
                }
                document.head.appendChild(element);
            }, 100 * cnt);
        });
    }

}
