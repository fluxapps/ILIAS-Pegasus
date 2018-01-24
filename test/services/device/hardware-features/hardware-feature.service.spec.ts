import {HardwareFeatureValidator} from "../../../../src/services/device/hardware-features/hardware-feature.service";
import {SinonSandbox, createSandbox, SinonStub} from "sinon";
import {Diagnostic} from "@ionic-native/diagnostic";
import {stubInstance} from "../../../SinonUtils";
import {ModalController, NavController, Platform} from "ionic-angular";

describe("a hardware feature validator", () => {

    const sandbox: SinonSandbox = createSandbox();

    const mockDiagnostic: Diagnostic = stubInstance(Diagnostic);
    const mockModalCtrl: ModalController = stubInstance(ModalController);
    const mockNav: NavController = stubInstance(NavController);
    const mockPlatform: Platform = stubInstance(Platform);

    let validator: HardwareFeatureValidator = new HardwareFeatureValidator(mockDiagnostic, mockModalCtrl, mockNav, mockPlatform);

	beforeEach(() => {
		validator = new HardwareFeatureValidator(mockDiagnostic, mockModalCtrl, mockNav, mockPlatform);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("require device location", () => {

		context("on location denied", () => {

			it("should create a fallback screen modal", async() => {

        sandbox.stub(mockDiagnostic, "permissionStatus").returns({DENIED: "DENIED"});

				sandbox.stub(mockDiagnostic, "getLocationAuthorizationStatus")
          .resolves("DENIED");

        const modalStub: SinonStub = sandbox.stub(mockModalCtrl, "create")
          .returns({
            present: (): void => {},
            onDidDismiss: (): void => {}
          });


        await validator.requireLocation();


				sandbox.assert.calledOnce(modalStub);
			});
		});
	});
});
