import * as chaiAsPromised from "chai-as-promised";
import {SinonSandbox, createSandbox, SinonStub, assert, stub} from "sinon";
import {LocationRequirement} from "../../../../src/services/device/hardware-features/hardware-requirements";
import {ModalController} from "ionic-angular";
import {stubInstance} from "../../../SinonUtils";
import {DiagnosticUtil} from "../../../../src/services/device/hardware-features/diagnostics.util";
import {LocationAccessError} from "../../../../src/services/device/hardware-features/hardware-access.errors";

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

	describe("check location", () => {

		context("on disabled location", () => {

			it("should create a modal window", async() => {

        sandbox.stub(mockDiagnosticUtil, "isLocationEnabled")
          .resolves(false);

        const modalPresentStub: SinonStub = stub();
        const modalStub: SinonStub = sandbox.stub(mockModalCtrl, "create")
          .returns({
            present: modalPresentStub
          });

        await chai.expect(location.check())
          .rejectedWith(LocationAccessError)
          .and.eventually.to.have.property("message", "Can not use location: Permission Denied");

        assert.calledOnce(modalStub);
        assert.calledOnce(modalPresentStub);
			});
		});

		context("on disabled location with on failure action", () => {

			it("should create a modal window and execute the failure action", async() => {

        sandbox.stub(mockDiagnosticUtil, "isLocationEnabled")
          .resolves(false);

        const modalPresentStub: SinonStub = stub();
        const modalOnDidDismissStub: SinonStub = stub();
        const modalStub: SinonStub = sandbox.stub(mockModalCtrl, "create")
          .returns({
            present: modalPresentStub,
            onDidDismiss: modalOnDidDismissStub
          });

        location.onFailure(stub);

        await chai.expect(location.check())
          .rejectedWith(LocationAccessError)
          .and.eventually.to.have.property("message", "Can not use location: Permission Denied");

        assert.calledOnce(modalStub);
        assert.calledOnce(modalPresentStub);
        assert.calledOnce(modalOnDidDismissStub);
			})
		});
	});
});
