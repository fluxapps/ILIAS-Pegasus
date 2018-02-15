import {SinonSandbox, createSandbox} from "sinon";
import * as chaiAsPromised from "chai-as-promised";
import {UserEntity} from "../../../src/entity/user.entity";
import {InstallationLinkSupplier, TokenSupplier} from "../../../src/services/link/link-builder.supplier";
import {Optional} from "../../../src/util/util.optional";
import {UserRepository} from "../../../src/providers/repository/repository.user";
import {TimelineLinkBuilder, TimelineLinkBuilderImpl} from "../../../src/services/link/timeline.builder";
import {IllegalStateError, NoSuchElementError} from "../../../src/error/errors";
import {DefaultLinkBuilder, DefaultLinkBuilderImpl} from "../../../src/services/link/default.builder";

chai.use(chaiAsPromised);

describe("A default link builder ", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockInstallationLinkSupplier: InstallationLinkSupplier = <InstallationLinkSupplier>{
    get: (): Promise<string> => undefined
  };

  const mockTokenSupplier: TokenSupplier = <TokenSupplier>{
    get: (): Promise<string> => undefined
  };

  const mockUserRepository: UserRepository = <UserRepository>{
    findAuthenticatedUser: (): Promise<Optional<UserEntity>> => undefined
  };

  let subject: DefaultLinkBuilder = new DefaultLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);

  beforeEach(() => {
    subject = new DefaultLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("building a link", () => {

    context("without a ref id", () => {

      it("should throw an illegal state error.", async () => {

        await chai.expect(subject.build())
          .to.be.rejectedWith(IllegalStateError)
          .to.eventually.have.property("message", "Required ref id was not found, ILIAS default link build failed.");
      });
    });

    context("without an authenticated user", () => {

      it("should throw a no such element error.", async () => {

        const refId: number = 15;
        subject.target(refId);

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.empty());

        await chai.expect(subject.build())
          .to.be.rejectedWith(NoSuchElementError)
          .to.eventually.have.property("message", "No authenticated user found, unable to build default ILIAS link.");
      });
    });

    context("with an authenticated user and a valid ref id", () => {

      it("should build the ILIAS default object link.", async () => {

        const token: string = "auth token";
        const installation: string = "http://ilias.de";
        const refId: number = 15;
        const userId: number = 6;
        subject.target(refId);
        const user: UserEntity = new UserEntity();
        user.iliasUserId = userId;

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.of(user));

        sandbox.stub(mockTokenSupplier, "get")
          .resolves(token);

        sandbox.stub(mockInstallationLinkSupplier, "get")
          .resolves("http://ilias.de");

        await chai.expect(subject.build())
          .to.be.eventually.equal(`${installation}/goto.php?target=ilias_app_auth|${user.iliasUserId}|${refId}|default|${token}`);
      });
    });
  })
});
