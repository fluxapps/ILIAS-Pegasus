import { TestBed } from "@angular/core/testing";
import { Network } from "@ionic-native/network/ngx";
import { Events } from "@ionic/angular";
import { createSpyObject } from "../../test.util.spec";

import { NetworkProvider } from "./network.provider";

describe("NetworkProvider", () => {
    let service: NetworkProvider;

    const spyNetwork: jasmine.SpyObj<Network> = createSpyObject(Network);
    const spyEvents: jasmine.SpyObj<Events> = createSpyObject(Events);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Network, useValue: spyNetwork},
                {provide: Events, useValue: spyEvents}
            ]
        });
        service = TestBed.get(NetworkProvider);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
