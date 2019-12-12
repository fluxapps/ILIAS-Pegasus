import {ConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {InstallationLinkSupplier, InstallationLinkSupplierImpl} from "./link-builder.supplier";
import {UserRepository} from "../../providers/repository/repository.user";
import {Optional} from "../../util/util.optional";
import {UserEntity} from "../../entity/user.entity";
import {NoSuchElementError} from "../../error/errors";

describe("An installation link supplier", () => {

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

  describe("getting the installation url", () => {

    describe("without an authenticated user", () => {

      it("should throw a corresponding error.", async() => {
          spyOn(mockUserRepository, "findAuthenticatedUser")
            .and.returnValue(Promise.resolve(Optional.empty()));

          await expectAsync(subject.get())
            .toBeRejectedWithError(NoSuchElementError, "No authenticated user found.");
      });
    });

    describe("without a valid installation id", () => {

      it("should throw a corresponding error.", async() => {
        const user: UserEntity = new UserEntity();
        user.installationId = -1; // invalid installation id

        spyOn(mockUserRepository, "findAuthenticatedUser")
          .and.returnValue(Promise.resolve(Optional.of(user)));

        spyOn(mockConfigProvider, "loadInstallation")
          .and.returnValue(Promise.reject(new ReferenceError()));

        await expectAsync(subject.get())
          .toBeRejectedWithError(ReferenceError);
      });
    });

    describe("with authenticated user and installation", () => {

      it("should return the current installation url.", async() => {
        const user: UserEntity = new UserEntity();
        user.installationId = 1;

        const installation: ILIASInstallation = <ILIASInstallation>{
          id: 1,
          url: "https://best.ilias.de"
        };

        spyOn(mockUserRepository, "findAuthenticatedUser")
          .and.returnValue(Promise.resolve(Optional.of(user)));

        spyOn(mockConfigProvider, "loadInstallation")
          .and.returnValue(Promise.resolve(installation));

        await expectAsync(subject.get())
          .toBeResolvedTo(installation.url);
      });
    });
  });
});
