import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {isDevMode} from "./devmode";
import {AuthenticationProvider} from "./providers/authentification/authentication.provider";

const routes: Routes = [
    {path: "", redirectTo: "tabs", pathMatch: "full"},
    {path: "tabs", loadChildren: "./tabs/tabs.module#TabsPageModule", canActivate: [AuthenticationProvider]},
    {path: "login", loadChildren: "./pages/login/login.module#LoginPageModule"},
    {path: "learnplace/:id", loadChildren: "./learnplace/learnplace.module#LearnplaceModule", canActivate: [AuthenticationProvider]},
    {path: "**", redirectTo: "login"}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        enableTracing: isDevMode(),
        relativeLinkResolution: "corrected"
    }),
    ], //, {enableTracing: true}
    exports: [RouterModule],
})
export class AppRoutingModule {}
