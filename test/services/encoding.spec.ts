import {Base64, Base64EncodedData} from "../../src/services/encoding";
import {SinonSandbox, createSandbox} from "sinon";
import {File} from "@ionic-native/file";
import {stubInstance} from "../SinonUtils";

describe("Base64 encoding", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockFile: File = stubInstance(File);

  let base64: Base64 = new Base64(mockFile);

	beforeEach(() => {
		base64 = new Base64(mockFile);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("encode a file url", () => {

		context("on encoded file", () => {

			it("should return the Base64 encoded file data", async() => {

			  const url: string = "file:///host/path/test.png";

			  const text: string = "some text";
				sandbox.stub(mockFile, "readAsText")
          .resolves(text);


				const result: Base64EncodedData = await base64.encode(url);


				const expected: Base64EncodedData = new Base64EncodedData("image/png", btoa(text));
				chai.expect(result)
          .to.be.deep.equal(expected);

			});
		});
	});
});
