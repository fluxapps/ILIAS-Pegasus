import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {isDevMode} from "./devmode";
import {AuthenticationProvider} from "./providers/authentication.provider";

const routes: Routes = [
    {path: "", redirectTo: "tabs", pathMatch: "full"},
    {path: "tabs", loadChildren: () => import("./tabs/tabs.module").then((m) => m.TabsPageModule), canActivate: [AuthenticationProvider]},
    {path: "login", loadChildren: () => import("./pages/login/login.module").then((m) => m.LoginPageModule)},
    {path: "onboarding", loadChildren: () => import("./pages/onboarding/onboarding.module").then((m) => m.OnboardingPageModule)},
    {
        path: "learnplace",
        loadChildren: () => import("./pages/learnplace/learnplace.module").then((m) => m.LearnplacePageModule),
        canActivate: [AuthenticationProvider]
    },
    {
        path: "learningmodule",
        loadChildren: () => import("./learningmodule/learning-module.module").then((m) => m.LearningModuleModule),
        canActivate: [AuthenticationProvider]
    },
    {path: "**", redirectTo: "login"},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        relativeLinkResolution: "corrected",
        enableTracing: isDevMode()
    }),
    ], //, {enableTracing: true}
    exports: [RouterModule],
})
export class AppRoutingModule {}
