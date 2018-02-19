import {SinonSandbox, createSandbox} from "sinon";
import * as chaiAsPromised from "chai-as-promised";
import {UserEntity} from "../../../src/entity/user.entity";
import {InstallationLinkSupplier, TokenSupplier} from "../../../src/services/link/link-builder.supplier";
import {Optional} from "../../../src/util/util.optional";
import {UserRepository} from "../../../src/providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../../src/error/errors";
import {ResourceLinkBuilder, ResourceLinkBuilderImpl} from "../../../src/services/link/resource.builder";

chai.use(chaiAsPromised);

describe("A resource link builder ", () => {

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

  let subject: ResourceLinkBuilder = new ResourceLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);

  beforeEach(() => {
    subject = new ResourceLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("building a link", () => {

    context("without a resource path", () => {

      it("should throw an illegal state error.", async() => {

        await chai.expect(subject.build())
          .to.be.rejectedWith(IllegalStateError)
          .to.eventually.have.property("message", "Required resource path was not found, ILIAS resource link build failed.");
      });
    });

    context("without an authenticated user", () => {

      it("should throw a no such element error.", async() => {

        const path: string = "/data/xsrl_13/bild.jpg";
        subject.resource(path);

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.empty());

        await chai.expect(subject.build())
          .to.be.rejectedWith(NoSuchElementError)
          .to.eventually.have.property("message", "No authenticated user found, unable to build resource ILIAS link.");
      });
    });

    context("with an authenticated user and a valid resource path", () => {

      it("should build the ILIAS resource link.", async() => {

        const token: string = "auth token";
        const installation: string = "http://ilias.de";
        const path: string = "/data/xsrl_13/bild.jpg";
        const userId: number = 6;
        subject.resource(path);
        const user: UserEntity = new UserEntity();
        user.iliasUserId = userId;

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.of(user));

        sandbox.stub(mockTokenSupplier, "get")
          .resolves(token);

        sandbox.stub(mockInstallationLinkSupplier, "get")
          .resolves("http://ilias.de");

        await chai.expect(subject.build())
          .to.be.eventually.equal(`${installation}/${path}?user=${user.iliasUserId}&token=${token}`);
      });
    });
  })
});
