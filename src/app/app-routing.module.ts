import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {AuthenticationProvider} from "./providers/authentification/authentication.provider";
import {TabsPage} from "./tabs/tabs.page";
import {ObjectListPage} from "./pages/object-list/object-list";

const routes: Routes = [
    {path: "", redirectTo: "tabs", pathMatch: "full"},
    {path: "tabs", loadChildren: "./tabs/tabs.module#TabsPageModule",  canActivate: [AuthenticationProvider]},
    {path: "login", loadChildren: "./pages/login/login.module#LoginPageModule"},
    {path: "**", redirectTo: "login"}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
    exports: [RouterModule],
})
export class AppRoutingModule {}
