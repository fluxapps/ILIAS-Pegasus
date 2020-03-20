import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {TabsPage} from "./tabs.page";

const routes: Routes = [
    {path: "", component: TabsPage,
        children: [
            {path: "home",
                children: [
                    {path: "", loadChildren: "../pages/desktop/desktop.module#DesktopPageModule"},
                ]
            },
            {path: "content",
                children: [
                    {path: "", redirectTo: "0", pathMatch: "full"},
                    {path: "details", loadChildren: "../pages/object-details/object-details.module#ObjectDetailsPageModule"},
                    {path: ":depth", loadChildren: "../pages/object-list/object-list.module#ObjectListPageModule"},
                ]
            },
            {path: "news",
                children: [
                    {path: "", loadChildren: "../pages/news/news.module#NewsPageModule"},
                ]
            },
            {path: "favorites",
                children: [
                    {path: "", redirectTo: "0", pathMatch: "full"},
                    {path: "details", loadChildren: "../pages/object-details/object-details.module#ObjectDetailsPageModule"},
                    {path: ":depth", loadChildren: "../pages/object-list/object-list.module#ObjectListPageModule"},
                ]
            },
            {path: "menu",
                children: [
                    {path: "", loadChildren: "../learningmodule/pages/scorm/scorm.module#ScormPageModule"}, // TODO dev
                    {path: "", loadChildren: "../pages/menu/menu.module#MenuPageModule"},
                    {path: "settings", loadChildren: "../pages/settings/settings.module#SettingsPageModule"},
                    {path: "info", loadChildren: "../pages/info/info.module#InfoPageModule"},
                ]
            },
            {path: "**", redirectTo: "home"},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {}
