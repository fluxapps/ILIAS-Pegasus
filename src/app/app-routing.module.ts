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

const routes: Routes = [
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "login", component: LoginPage},
    {path: "tabs", component: TabmenuPage,
        children: [
            {path: "", redirectTo: "home", pathMatch: "full"},
            {path: "home", component: DesktopPage},
            {path: "content/:favorite", component: ObjectListPage},
            {path: "news", component: NewsPage},
            {path: "menu", component: MenuPage},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
