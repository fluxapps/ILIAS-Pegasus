import {createSpyObject} from "../../../test.util.spec";
import { ILIASTokenManager, TokenExpiredError } from "./ilias.rest";
import {HttpClient, HttpResponse} from "../http";
import {
  ClientCredentials, OAuth2DataSupplier, Token,
  TokenResponseConsumer
} from "./ilias.rest-api";

const ONE_HOUR_IN_SEC: number = 3600;
const TWO_HOURS_IN_SEC: number = 7200;
const FACTOR_SEC_TO_MILLI: number = 1000;

describe("a ILIAS token manager", () => {

  //const sandbox: SinonSandbox = createSandbox();

    let mockHttpClient: jasmine.SpyObj<HttpClient> = createSpyObject(HttpClient);
    let mockDataSupplier: OAuth2DataSupplier = <OAuth2DataSupplier>{
        getClientCredentials: (): {} => undefined
    };
    let mockResponseConsumer: TokenResponseConsumer = <TokenResponseConsumer>{
        accept: (arg): {} => undefined
    };

  let manager: ILIASTokenManager = new ILIASTokenManager(mockHttpClient, mockDataSupplier, mockResponseConsumer);

	beforeEach(() => {
	    mockHttpClient = createSpyObject(HttpClient);
	    mockDataSupplier = <OAuth2DataSupplier>{
            getClientCredentials: (): {} => undefined
        };
	    mockResponseConsumer = <TokenResponseConsumer>{
            accept: (arg): {} => undefined
        };
		manager = new ILIASTokenManager(mockHttpClient, mockDataSupplier, mockResponseConsumer);
	});

	afterEach(() => {

		//sandbox.restore();
	});

	describe("an access token to get", () => {

        describe("valid access token", () => {

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
			  spyOn(mockDataSupplier, "getClientCredentials")
                  .and.returnValue(Promise.resolve(clientCredentials));


        const token: string = await manager.getAccessToken();


        expect(token).toEqual("access");
			});
		});

        describe("expired access token", () => {

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
        spyOn(mockDataSupplier, "getClientCredentials")
            .and.returnValue(Promise.resolve(clientCredentials));


        const mockResponse: jasmine.SpyObj<HttpResponse> = createSpyObject(HttpResponse);
        mockResponse.json
          .and.returnValue({
            access_token: "new access token",
            refresh_token: "refresh token",
            expires_in: ONE_HOUR_IN_SEC,
            token_type: "bearer"
          });

        const handleStub: jasmine.Spy = mockResponse.handle.and.callFake((args) => {
            return args(mockResponse);
          });

        mockHttpClient.post.and.returnValue(Promise.resolve(mockResponse));

        const consumeStub: jasmine.Spy = spyOn(mockResponseConsumer, "accept");


        const token: string = await manager.getAccessToken();


        expect(consumeStub).toHaveBeenCalledTimes(1);
        expect(handleStub).toHaveBeenCalledTimes(1);
        expect(token).toEqual("new access token");
			})
		});

		describe("thrown error from dependency", () => {

			it("should throw a token expired error", async() => {

		    spyOn(mockDataSupplier, "getClientCredentials").and.returnValue(Promise.reject("Test Error"));

		    await expectAsync(manager.getAccessToken()).toBeRejectedWithError(TokenExpiredError, "Could not get a valid access token")
			})
		});
	});
});
