var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** angular */
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
/** pages */
import { LoginPage } from "./pages/login/login";
import { TabmenuPage } from "./pages/tabmenu/tabmenu";
import { DesktopPage } from "./pages/desktop/desktop";
import { ObjectListPage } from "./pages/object-list/object-list";
import { NewsPage } from "./pages/news/news";
import { FavoritesPage } from "./pages/favorites/favorites";
import { MenuPage } from "./pages/menu/menu";
var routes = [
    { path: "", redirectTo: "login", pathMatch: "full" },
    { path: "login", component: LoginPage },
    { path: "tabs", component: TabmenuPage,
        children: [
            { path: "", redirectTo: "home", pathMatch: "full" },
            { path: "home", component: DesktopPage },
            { path: "content", component: ObjectListPage },
            { path: "news", component: NewsPage },
            { path: "favorites", component: FavoritesPage },
            { path: "menu", component: MenuPage },
        ]
    }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        NgModule({
            imports: [RouterModule.forRoot(routes)],
            exports: [RouterModule]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map