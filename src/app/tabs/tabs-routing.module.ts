import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "tabs",
    component: TabsPage,
    children:
      [
        {
          path: "home",
          children:
            [
              {
                path: "",
                loadChildren: "../pages/desktop/desktop.module#DesktopPageModule"
              }
            ]
        },
        {
            path: "content",
            children:
              [ 
                {
                  path: "",
                  redirectTo: "0/0",
                  loadChildren: "../pages/object-list/object-list.module#ObjectListPageModule"
                },
                // {
                //   path: "0/0",
                  
                // },
                {
                  path: ":depth/:favorite",
                  loadChildren: "../pages/object-list/object-list.module#ObjectListPageModule"
                },
                {
                  path: "details",
                  loadChildren: "../pages/object-details/object-details.module#ObjectDetailsPageModule"
                },

              ]
        },
        {
          path: "news",
          children:
            [
              {
                path: "",
                loadChildren: "../pages/news/news.module#NewsPageModule"
              }
            ]
        },
        {
          path: "favorites",
          children:
            [ 
              {
                path: "",
                redirectTo: "0/1",
                loadChildren: "../pages/object-list/object-list.module#ObjectListPageModule"
              },
              {
                path: ":depth/:favorite",
                loadChildren: "../pages/object-list/object-list.module#ObjectListPageModule"
              },
              {
                path: "details",
                loadChildren: "../pages/object-details/object-details.module#ObjectDetailsPageModule"
              },

            ]
      },
        {
          path: "menu",
          children:
            [
              {
                path: "",
                loadChildren: "../pages/menu/menu.module#MenuPageModule"
              },
              {
                path: "settings",
                loadChildren: "../pages/settings/settings.module#SettingsPageModule"
              },
              {
                path: "info",
                loadChildren: "../pages/info/info.module#InfoPageModule"
              }
            ]
        },
        {
          path: "",
          redirectTo: "home",
          pathMatch: "full"
        }
      ]
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  }
];

@NgModule({
  imports:
    [
      RouterModule.forChild(routes)
    ],
  exports:
    [
      RouterModule
    ]
})
export class TabsPageRoutingModule {}