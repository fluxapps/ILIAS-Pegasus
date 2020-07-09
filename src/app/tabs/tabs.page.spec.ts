import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import { TranslateModule } from "@ngx-translate/core";

import {TabsPage} from "./tabs.page";
import { NavController } from "@ionic/angular";

describe("TabsPage", () => {
    let component: TabsPage;
    let fixture: ComponentFixture<TabsPage>;

    let spyNavController: jasmine.Spy;

    beforeEach(async(() => {
        spyNavController = jasmine.createSpyObj(NavController.name, ["navigateForward"]);

        TestBed.configureTestingModule({
            declarations: [TabsPage],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: NavController, useValue: spyNavController }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TabsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
