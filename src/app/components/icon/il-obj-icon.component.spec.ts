import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {IonicModule} from "@ionic/angular";

import {IlObjIconComponent} from "./il-obj-icon.component";
import {ThemeProvider} from "../../providers/theme/theme.provider";
import {createSpyObject} from "../../../test.util.spec";
import {FeaturePolicyService} from "../../services/policy/feature-policy.service";
import {GenericILIASObjectPresenter} from "../../presenters/object-presenter";
import {ILIASObject} from "../../models/ilias-object";

describe("IlObjIconComponent", () => {
    let component: IlObjIconComponent;
    let fixture: ComponentFixture<IlObjIconComponent>;
    const spyThemeProvider: jasmine.SpyObj<ThemeProvider> = createSpyObject(ThemeProvider);
    const spyFeaturePolicy: jasmine.SpyObj<FeaturePolicyService> = createSpyObject(FeaturePolicyService);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IlObjIconComponent],
            imports: [
                IonicModule.forRoot()
            ],
            providers: [
                {provide: ThemeProvider, useValue: spyThemeProvider},
                {provide: FeaturePolicyService, useValue: spyFeaturePolicy}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(IlObjIconComponent);
        component = fixture.componentInstance;
    }));

    it("should create", () => {
        const obj: ILIASObject = new ILIASObject(0);
        component.presenter = new GenericILIASObjectPresenter(obj, spyThemeProvider);
        component.ilObject = obj;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
