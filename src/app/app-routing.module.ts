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
/** misc */
import {AuthenticationProvider} from "./providers/authentification/authentication.provider";

const routes: Routes = [
    {path: "", redirectTo: "tabs", pathMatch: "full"},
    {path: "login", component: LoginPage},
    {path: "tabs", component: TabmenuPage, canActivate: [AuthenticationProvider],
        children: [
            {path: "", redirectTo: "home", pathMatch: "full"},
            {path: "home", component: DesktopPage},
            {path: "content/:depth/:favorite", component: ObjectListPage},
            {path: "content/details", component: ObjectDetailsPage},
            {path: "news", component: NewsPage},
            {path: "menu/main", component: MenuPage},
            {path: "menu/settings", component: SettingsPage},
            {path: "menu/info", component: InfoPage}
        ]
    },
    {path: "**", redirectTo: "login"}
];

@NgModule({
    imports: [RouterModule.forRoot(
        routes,
        //{enableTracing: true} // uncomment to log all navigation-events
    )],
    exports: [RouterModule]
})
export class AppRoutingModule { }
