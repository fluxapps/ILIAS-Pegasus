/** angular */
import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
/** pages */
import {LoginPage} from "./pages/login/login";
import {TabmenuPage} from "./pages/tabmenu/tabmenu";
import {DesktopPage} from "./pages/desktop/desktop";
import {ObjectListPage} from "./pages/object-list/object-list";
import {NewsPage} from "./pages/news/news";
import {MenuPage} from "./pages/menu/menu";
import {SettingsPage} from "./pages/settings/settings";
import {InfoPage} from "./pages/info/info";
import {ObjectDetailsPage} from "./pages/object-details/object-details";

const routes: Routes = [
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "login", component: LoginPage},
    {path: "tabs", component: TabmenuPage,
        children: [
            {path: "", redirectTo: "home", pathMatch: "full"},
            {path: "home", component: DesktopPage},
            {path: "content", component: ObjectListPage,
                children: [{path: "details", component: ObjectDetailsPage}]
            },
            {path: "content/:depth", component: ObjectListPage},
            {path: "content/:depth/:favorite", component: ObjectListPage},
            {path: "news", component: NewsPage},
            {path: "menu", component: MenuPage},
        ]
    },
    {path: "settings", component: SettingsPage},
    {path: "info", component: InfoPage}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
