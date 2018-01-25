import * as chaiAsPromised from "chai-as-promised";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {LocationRequirement} from "../../../../src/services/device/hardware-features/hardware-requirements";
import {ModalController} from "ionic-angular";
import {stubInstance} from "../../../SinonUtils";
import {DiagnosticUtil} from "../../../../src/services/device/hardware-features/diagnostics.util";

chai.use(chaiAsPromised);

describe("a location requirement", () => {

    const sandbox: SinonSandbox = createSandbox();

    const mockModalCtrl: ModalController = stubInstance(ModalController);
    const mockDiagnosticUtil: DiagnosticUtil = stubInstance(DiagnosticUtil);

    let location: LocationRequirement = new LocationRequirement(mockModalCtrl, mockDiagnosticUtil);

	beforeEach(() => {
		location = new LocationRequirement(mockModalCtrl, mockDiagnosticUtil)
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("check location is disabled", () => {

		context("on non failure action", () => {

			it("should create a modal window", async() => {

        sandbox.stub(mockDiagnosticUtil, "isLocationEnabled")
          .resolves(false);

        const modalStub: SinonStub = sandbox.stub(mockModalCtrl, "create")
          .returns({
            present: (): void => {}
          });

        await location.check();

        assert.calledOnce(modalStub);

			});
		});
	});
});
