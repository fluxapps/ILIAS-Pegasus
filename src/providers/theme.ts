import {Injectable} from "@angular/core";

@Injectable()
export class ThemeProvider {

    private readonly theme: string;

    constructor() {
        this.theme = "vanilla";
    }

    getAsset(file: string, depth: number = 0, quotes: boolean = false): string {
        const path: string = `${"../".repeat(depth)}assets/${this.theme}/${file}`;
        return quotes ? `'${path}'` : path;
    }

}
