/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {IonicPageModule} from "ionic-angular";
/** news */
import {NEWS_FEED, NewsFeedImpl} from "../../services/news/news.feed";
import {NewsPage} from "./news";
/** misc */
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [
        NewsPage
    ],
    imports: [
        IonicPageModule.forChild(NewsPage),
        CommonModule,
        TranslateModule
    ],
    providers: [
        /* from src/services/news/news.feed */
        {
            provide: NEWS_FEED,
            useClass: NewsFeedImpl
        }
    ],
    entryComponents: [
        NewsPage
    ]
})
export class NewsPageModule {}
