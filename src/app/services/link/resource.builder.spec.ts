import {UserEntity} from "../../entity/user.entity";
import {InstallationLinkSupplier, TokenSupplier} from "./link-builder.supplier";
import {Optional} from "../../util/util.optional";
import {UserRepository} from "../../providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {ResourceLinkBuilder, ResourceLinkBuilderImpl} from "./resource.builder";

describe("A resource link builder ", () => {

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

  describe("building a link", () => {

    describe("without a resource path", () => {

      it("should throw an illegal state error.", async() => {

        await expectAsync(subject.build())
          .toBeRejectedWithError(IllegalStateError, "Required resource path was not found, ILIAS resource link build failed.");
      });
    });

    describe("without an authenticated user", () => {

      it("should throw a no such element error.", async() => {

        const path: string = "/data/xsrl_13/bild.jpg";
        subject.resource(path);

        spyOn(mockUserRepository, "findAuthenticatedUser")
          .and.returnValue(Promise.resolve(Optional.empty()));

        await expectAsync(subject.build())
          .toBeRejectedWithError(NoSuchElementError, "No authenticated user found, unable to build resource ILIAS link.");
      });
    });

    describe("with an authenticated user and a valid resource path", () => {

      it("should build the ILIAS resource link.", async() => {

        const token: string = "auth token";
        const installation: string = "http://ilias.de";
        const path: string = "/data/xsrl_13/bild.jpg";
        const userId: number = 6;
        subject.resource(path);
        const user: UserEntity = new UserEntity();
        user.iliasUserId = userId;

        spyOn(mockUserRepository, "findAuthenticatedUser")
          .and.returnValue(Promise.resolve(Optional.of(user)));

        spyOn(mockTokenSupplier, "get")
          .and.returnValue(Promise.resolve(token));

        spyOn(mockInstallationLinkSupplier, "get")
          .and.returnValue(Promise.resolve("http://ilias.de"));

        await expectAsync(subject.build())
          .toBeResolvedTo(`${installation}/${path}?user=${user.iliasUserId}&token=${token}&target=ilias_app_resource`);
      });
    });
  })
});
