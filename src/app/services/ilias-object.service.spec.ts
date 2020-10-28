import {TestBed} from "@angular/core/testing";

import {IliasObjectService} from "./ilias-object.service";
import {ILIAS_REST, ILIASRest, ILIASRestImpl} from "../providers/ilias/ilias.rest";
import {createSpyObject} from "../../test.util.spec";

describe("IliasObjectService", () => {
    let service: IliasObjectService;
    const spyRest: jasmine.SpyObj<ILIASRest> = createSpyObject(ILIASRestImpl);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: ILIAS_REST, useValue: spyRest}
            ]
        });
        service = TestBed.get(IliasObjectService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
