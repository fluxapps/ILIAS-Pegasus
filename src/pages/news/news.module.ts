import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {TranslateModule} from "@ngx-translate/core";
import {NEWS_FEED, NewsFeedImpl} from "../../services/news/news.feed";
import {NewsPage} from "./news";
import {CommonModule} from "@angular/common";

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
