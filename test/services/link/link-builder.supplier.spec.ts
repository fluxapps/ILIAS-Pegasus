import {SinonSandbox, createSandbox} from "sinon";
import * as chaiAsPromised from "chai-as-promised";
import {ConfigProvider, ILIASInstallation} from "../../../src/config/ilias-config";
import {InstallationLinkSupplier, InstallationLinkSupplierImpl} from "../../../src/services/link/link-builder.supplier";
import {UserRepository} from "../../../src/providers/repository/repository.user";
import {Optional} from "../../../src/util/util.optional";
import {UserEntity} from "../../../src/entity/user.entity";
import {NoSuchElementError} from "../../../src/error/errors";

// enables promise assert with chai
chai.use(chaiAsPromised);

describe("An installation link supplier", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockConfigProvider: ConfigProvider = <ConfigProvider>{
    loadInstallation: (installationId: number): Promise<ILIASInstallation> => undefined
  };

  const mockUserRepository: UserRepository = <UserRepository>{
    findAuthenticatedUser: (): Promise<Optional<UserEntity>> => undefined
  };

  let subject: InstallationLinkSupplier = new InstallationLinkSupplierImpl(mockConfigProvider, mockUserRepository);

  beforeEach(() => {
    subject = new InstallationLinkSupplierImpl(mockConfigProvider, mockUserRepository);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getting the installation url", () => {

    context("without an authenticated user", () => {

      it("should throw a corresponding error.", async() => {
          sandbox.stub(mockUserRepository, "findAuthenticatedUser")
            .resolves(Optional.empty());

          await chai.expect(subject.get())
            .to.be.rejectedWith(NoSuchElementError)
            .to.eventually.have.property("message", "No authenticated user found.");
      });
    });

    context("without a valid installation id", () => {

      it("should throw a corresponding error.", async() => {
        const user: UserEntity = new UserEntity();
        user.installationId = -1; // invalid installation id

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.of(user));

        sandbox.stub(mockConfigProvider, "loadInstallation")
          .rejects(new ReferenceError());

        await chai.expect(subject.get())
          .to.be.rejectedWith(ReferenceError);
      });
    });

    context("with authenticated user and installation", () => {

      it("should return the current installation url.", async() => {
        const user: UserEntity = new UserEntity();
        user.installationId = 1;

        const installation: ILIASInstallation = <ILIASInstallation>{
          id: 1,
          url: "https://best.ilias.de"
        };

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.of(user));

        sandbox.stub(mockConfigProvider, "loadInstallation")
          .resolves(installation);

        await chai.expect(subject.get())
          .to.eventually.be.equal(installation.url);
      });
    });
  });
});
