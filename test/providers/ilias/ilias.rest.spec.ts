import { ILIASTokenManager, TokenExpiredError } from "../../../src/providers/ilias/ilias.rest";
import {SinonSandbox, createSandbox, SinonStub} from "sinon";
import {stubInstance} from "../../SinonUtils";
import {HttpClient, HttpResponse} from "../../../src/providers/http";
import * as chaiAsPromised from "chai-as-promised";
import {
  ClientCredentials, OAuth2DataSupplier, Token,
  TokenResponseConsumer
} from "../../../src/providers/ilias/ilias.rest-api";

// enables promise assert with chai
chai.use(chaiAsPromised);

const ONE_HOUR_IN_SEC: number = 3600;
const TWO_HOURS_IN_SEC: number = 7200;
const FACTOR_SEC_TO_MILLI: number = 1000;

describe("a ILIAS token manager", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockHttpClient: HttpClient = stubInstance(HttpClient);
  const mockDataSupplier: OAuth2DataSupplier = <OAuth2DataSupplier>{
    getClientCredentials: (): {} => undefined
  };
  const mockResponseConsumer: TokenResponseConsumer = <TokenResponseConsumer>{
    accept: (arg): {} => undefined
  };

  let manager: ILIASTokenManager = new ILIASTokenManager(mockHttpClient, mockDataSupplier, mockResponseConsumer);

	beforeEach(() => {
		manager = new ILIASTokenManager(mockHttpClient, mockDataSupplier, mockResponseConsumer);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("an access token to get", () => {

		context("valid access token", () => {

			it("should return the access token", async() => {

			  const clientCredentials: ClientCredentials = <ClientCredentials>{
			    clientId: "client id",
          clientSecret: "secret",
          apiURL: "https/ilias.de",
          accessTokenURL: "https://ilias.de/token",
          token: <Token>{
			      type: "Bearer",
            accessToken: "access",
            refreshToken: "refresh",
            lastAccessTokenUpdate: Date.now() / FACTOR_SEC_TO_MILLI,
            accessTokenTTL: ONE_HOUR_IN_SEC
          }
        };
			  sandbox.stub(mockDataSupplier, "getClientCredentials")
          .resolves(clientCredentials);


        const token: string = await manager.getAccessToken();


        chai.expect(token)
          .to.deep.equal("access");
			});
		});

		context("expired access token", () => {

			it("should get a new access token", async() => {

        const clientCredentials: ClientCredentials = <ClientCredentials>{
          clientId: "client id",
          clientSecret: "secret",
          apiURL: "https://ilias.de",
          accessTokenURL: "https://ilias.de/token",
          token: <Token>{
            type: "Bearer",
            accessToken: "access",
            refreshToken: "refresh",
            lastAccessTokenUpdate: Date.now() / FACTOR_SEC_TO_MILLI - TWO_HOURS_IN_SEC,
            accessTokenTTL: ONE_HOUR_IN_SEC
          }
        };
        sandbox.stub(mockDataSupplier, "getClientCredentials")
          .resolves(clientCredentials);


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

        const consumeStub: SinonStub = sandbox.stub(mockResponseConsumer, "accept");


        const token: string = await manager.getAccessToken();


        chai.assert.isTrue(consumeStub.calledOnce, "expected TokenResponseConsumer#accept method to be called once");
        chai.assert.isTrue(handleStub.calledOnce, "expected HttpResponse#handle method to be called once");
        chai.expect(token)
          .to.be.equal("new access token");
			})
		});

		context("thrown error from dependency", () => {

			it("should throw a token expired error", (done) => {

		    sandbox.stub(mockDataSupplier, "getClientCredentials")
          .throws(Error);


		    chai.expect(manager.getAccessToken())
          .to.be.rejectedWith(TokenExpiredError)
          .and.eventually.to.have.property("message", "Could not get a valid access token")
          .notify(done);
			})
		});
	});
});
