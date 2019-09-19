/** angular */
import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
/** pages */
// import {TabmenuPage} from "./pages/tabmenu/tabmenu";
// import {TabsPage} from "./tabs/tabs.page";
/** misc */
import {AuthenticationProvider} from "./providers/authentification/authentication.provider";

const routes: Routes = [
    // {path: "", redirectTo: "tabs", pathMatch: "full"},
    {path: "", loadChildren: "./tabs/tabs.module#TabsPageModule"},
    {path: "login", loadChildren: "./pages/login/login.module#LoginPageModule"},
//     {path: "tabs", loadChildren: "./tabs/tabs.module#TabsPageModule",
// },
    // {path: "tabs",  canActivate: [AuthenticationProvider],
    //     children: [
    //         {path: "", redirectTo: "home", pathMatch: "full"},
    //         {path: "home", loadChildren: "./pages/desktop/desktop.module#DesktopPageModule"},
    //         {path: "content/:depth/:favorite", loadChildren: "./pages/object-list/object-list.module#ObjectListPageModule"},
    //         {path: "content/details", loadChildren: "./pages/object-details/object-details.module#ObjectDetailsPageModule"},
    //         {path: "news", loadChildren: "./pages/news/news.module#NewsPageModule"},
    //         {path: "menu/main", loadChildren: "./pages/menu/menu.module#MenuPageModule"},
    //         {path: "menu/settings", loadChildren: "./pages/settings/settings.module#SettingsPageModule"},
    //         {path: "menu/info", loadChildren: "./pages/info/info.module#InfoPageModule"}
    //     ]
    // },
    {path: "**", redirectTo: "login"}
];

@NgModule({
    // imports: [RouterModule.forRoot(
    //     routes,
    //     //{enableTracing: true} // uncomment to log all navigation-events
    //     RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    // )],
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
      ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
