import { ActiveUserProvider, ILIASTokenManager, TokenExpiredError } from "../../../src/providers/ilias/ilias.rest";
import {SinonSandbox, createSandbox, SinonStub} from "sinon";
import {stubInstance} from "../../SinonUtils";
import {HttpClient, HttpResponse} from "../../../src/providers/http";
import {ConfigProvider, ILIASConfig, ILIASInstallation} from "../../../src/config/ilias-config";
import {User} from "../../../src/models/user";
import * as chaiAsPromised from "chai-as-promised";

// enables promise assert with chai
chai.use(chaiAsPromised);

const ONE_HOUR_IN_SEC: number = 3600;
const TWO_HOURS_IN_SEC: number = 7200;
const FACTOR_SEC_TO_MILLI: number = 1000;

describe("a ILIAS token manager", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockHttpClient: HttpClient = stubInstance(HttpClient);
  const mockConfigProvider: ConfigProvider = <ConfigProvider>{
    loadConfig: (): Promise<ILIASConfig> => undefined,
    loadInstallation: (): Promise<ILIASInstallation> => undefined
  };
  const mockActiveUser: ActiveUserProvider = stubInstance(ActiveUserProvider);

  let manager: ILIASTokenManager = new ILIASTokenManager(mockHttpClient, mockConfigProvider, mockActiveUser);

	beforeEach(() => {
		manager = new ILIASTokenManager(mockHttpClient, mockConfigProvider, mockActiveUser);

    const installation: ILIASInstallation = <ILIASInstallation>{
      id: 1,
      accessTokenTTL: ONE_HOUR_IN_SEC,
      title: "test name",
      url: "https://test.ilias.de",
      clientId: "default",
      apiKey: "key",
      apiSecret: "secret"
    };
    sandbox.stub(mockConfigProvider, "loadInstallation")
      .returns(installation);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("an access token to get", () => {

		context("valid access token", () => {

			it("should return the access token", async() => {

        const user: User = new User();
        user.accessToken = "access token";
        user.lastTokenUpdate = Date.now();

        sandbox.stub(mockActiveUser, "read")
          .resolves(user);


        const token: string = await manager.getAccessToken();


        chai.expect(token)
          .to.deep.equal("access token");
			});
		});

		context("expired access token", () => {

			it("should get a new access token", async() => {

        const user: User = new User();
        user.accessToken = "access token";
        user.refreshToken = "refresh token";
        user.lastTokenUpdate = Date.now() - TWO_HOURS_IN_SEC * FACTOR_SEC_TO_MILLI;

        sandbox.stub(mockActiveUser, "read")
          .resolves(user);

        const mockResponse: HttpResponse = stubInstance(HttpResponse);
        sandbox.stub(mockResponse, "json")
          .returns({
            access_token: "new access token",
            refresh_token: "refresh token",
            expires_in: ONE_HOUR_IN_SEC,
            token_type: "bearer"
          });

        const handleStub: SinonStub = sandbox.stub(mockResponse, "handle")
          .callsFake((args): Promise<string> => {
            return args(mockResponse);
          });

        sandbox.stub(mockHttpClient, "post")
          .resolves(mockResponse);

        const writeStub: SinonStub = sandbox.stub(mockActiveUser, "write");


        const token: string = await manager.getAccessToken();


        chai.assert.isTrue(writeStub.calledOnce, "expected ActiveUserRepository#write method to be called once");
        chai.assert.isTrue(handleStub.calledOnce, "expected HttpResponse#handle method to be called once");
        chai.expect(token)
          .to.be.equal("new access token");
			})
		});

		context("thrown error from dependency", () => {

			it("should throw a token expired error", (done) => {

		    sandbox.stub(mockActiveUser, "read")
          .throws(Error);


		    chai.expect(manager.getAccessToken())
          .to.be.rejectedWith(TokenExpiredError)
          .and.eventually.to.have.property("message", "Could not find a valid access token")
          .notify(done);
			})
		});
	});
});
