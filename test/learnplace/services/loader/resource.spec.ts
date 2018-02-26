import {HttpResourceTrasfer, ResourceLoadError} from "../../../../src/learnplace/services/loader/resource";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {File} from "@ionic-native/file";
import {stubInstance} from "../../../SinonUtils";
import {HttpClient, HttpResponse} from "../../../../src/providers/http";
import {LinkBuilder} from "../../../../src/services/link/link-builder.service";
import {Platform} from "ionic-angular";
import {UserRepository} from "../../../../src/providers/repository/repository.user";
import {Optional} from "../../../../src/util/util.optional";
import {UserEntity} from "../../../../src/entity/user.entity";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("a http resource transfer", () => {

  const sandbox: SinonSandbox = createSandbox();
  const mockFile: File = stubInstance(File);
  const mockHttp: HttpClient = stubInstance(HttpClient);
  const mockLinkBuilder: LinkBuilder = <LinkBuilder>{
    resource: () => undefined
  };
  const mockPlatform: Platform = stubInstance(Platform);
  const mockUserRepository: UserRepository = <UserRepository>{
    findAuthenticatedUser: () => undefined,
    save: () => undefined,
    find: () => undefined,
    exists: () => undefined,
    delete: () => undefined
  };

  let transfer: HttpResourceTrasfer = new HttpResourceTrasfer(mockFile, mockHttp, mockLinkBuilder, mockPlatform, mockUserRepository);

	beforeEach(() => {
		transfer = new HttpResourceTrasfer(mockFile, mockHttp, mockLinkBuilder, mockPlatform, mockUserRepository);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("transfer a resource", () => {

		context("on successful transfer", () => {

			it("should store the resource and return its absolute path", async() => {

				const resource: string = "/test/image01.png";

				sandbox.stub(mockPlatform, "is")
          .withArgs("ios") // does not matter, just for mocking the File correct
          .returns(true);

				sandbox.stub(mockFile, "dataDirectory") // ios needs this property
          .get(() => "absolute/file/path");

				sandbox.stub(mockLinkBuilder, "resource")
          .returns({
            resource: function(path: string): object {
              return {build: (): Promise<string> => Promise.resolve("http://example.com")}
            }
          });

				sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.of(new UserEntity().applies(function(): void {
            this.id = 1;
          })));

				const mockResponse: HttpResponse = stubInstance(HttpResponse);
				sandbox.stub(mockHttp, "get")
          .resolves(mockResponse);
				sandbox.stub(mockResponse, "text")
          .returns(""); // value does not matter

        const saveStub: SinonStub = sandbox.stub(mockFile, "writeFile")
          .resolves({}); // return type does not matter


        const result: string = await transfer.transfer(resource);


				const expected: string = "absolute/file/path/1/image01.png";
				await chai.expect(result)
          .to.be.equal(expected);

				assert.calledOnce(saveStub);
			});
		});

		context("on failed transfer", () => {

			it("should throw a resource load error", async() => {

        await chai.expect(transfer.transfer("test"))
          .rejectedWith(ResourceLoadError)
          .and.eventually.have.property("message", "Could not transfer resource: resource=test");
			})
		});
	});
});
