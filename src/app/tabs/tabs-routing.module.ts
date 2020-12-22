import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {TabsPage} from "./tabs.page";

const routes: Routes = [
    {path: "", component: TabsPage,
        children: [
            {path: "home",
                children: [
                    {
                        path: "",
                        loadChildren: () => import("../pages/desktop/desktop.module").then((m) => m.DesktopPageModule)
                    },
                ]
            },
            {path: "content",
                children: [
                    {path: "", redirectTo: "0", pathMatch: "full"},
                    {
                        path: "details",
                        loadChildren: () => import("../pages/object-details/object-details.module").then((m) => m.ObjectDetailsPageModule)
                    },
                    {
                        path: ":depth",
                        loadChildren: () => import("../pages/object-list/object-list.module").then((m) => m.ObjectListPageModule)
                    },
                ]
            },
            {path: "news",
                children: [
                    {
                        path: "",
                        loadChildren: () => import("../pages/news/news.module").then((m) => m.NewsPageModule)
                    },
                ]
            },
            {path: "favorites",
                children: [
                    {path: "", redirectTo: "0", pathMatch: "full"},
                    {
                        path: "details",
                        loadChildren: () => import("../pages/object-details/object-details.module").then((m) => m.ObjectDetailsPageModule)
                    },
                    {
                        path: ":depth",
                        loadChildren: () => import("../pages/object-list/object-list.module").then((m) => m.ObjectListPageModule)
                    },
                ]
            },
            {path: "menu",
                children: [
                    {
                        path: "",
                        loadChildren: () => import("../pages/menu/menu.module").then((m) => m.MenuPageModule)
                    },
                    {
                        path: "settings",
                        loadChildren: () => import("../pages/settings/settings.module").then((m) => m.SettingsPageModule)
                    },
                    {
                        path: "info",
                        loadChildren: () => import("../pages/info/info.module").then((m) => m.InfoPageModule)
                    },
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
