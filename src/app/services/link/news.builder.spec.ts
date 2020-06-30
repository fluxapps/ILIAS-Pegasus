import {UserEntity} from "../../entity/user.entity";
import {InstallationLinkSupplier, TokenSupplier} from "./link-builder.supplier";
import {Optional} from "../../util/util.optional";
import {UserRepository} from "../../providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {NewsLinkBuilder, NewsLinkBuilderImpl} from "./news.builder";

describe("A news link builder ", () => {

  const mockInstallationLinkSupplier: InstallationLinkSupplier = <InstallationLinkSupplier>{
    get: (): Promise<string> => undefined
  };

  const mockTokenSupplier: TokenSupplier = <TokenSupplier>{
    get: (): Promise<string> => undefined
  };

  const mockUserRepository: UserRepository = <UserRepository>{
    findAuthenticatedUser: (): Promise<Optional<UserEntity>> => undefined
  };

  let subject: NewsLinkBuilder = new NewsLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);

  beforeEach(() => {
    subject = new NewsLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);
  });

  describe("building a link", () => {

    describe("without a news id", () => {

      it("should throw an illegal state error.", async() => {

        await expectAsync(subject.build())
          .toBeRejectedWithError(IllegalStateError, "Required news id was not found, ILIAS news link build failed.");
      });
    });

    describe("without a news context id", () => {

      it("should throw an illegal state error.", async() => {

        const id: number = 15;
        subject.newsId(id);

        await expectAsync(subject.build())
          .toBeRejectedWithError(IllegalStateError, "Required news context id was not found, ILIAS news link build failed.");
      });
    });

    describe("without an authenticated user", () => {

      it("should throw a no such element error.", async() => {

        const id: number = 15;
        const context: number = 15;
        subject.newsId(id);
        subject.context(context);

        spyOn(mockUserRepository, "findAuthenticatedUser")
          .and.returnValue(Promise.resolve(Optional.empty()));

        await expectAsync(subject.build())
          .toBeRejectedWithError(NoSuchElementError, "No authenticated user found, unable to build news ILIAS link.");
      });
    });

    describe("with an authenticated user and a valid news id and context", () => {

      it("should build the ILIAS default object link.", async() => {

        const token: string = "auth token";
        const installation: string = "http://ilias.de";
        const id: number = 15;
        const userId: number = 6;
        const context: number = 6;
        subject.newsId(id);
        subject.context(context);

        const user: UserEntity = new UserEntity();
        user.iliasUserId = userId;

        spyOn(mockUserRepository, "findAuthenticatedUser")
          .and.returnValue(Promise.resolve(Optional.of(user)));

        spyOn(mockTokenSupplier, "get")
          .and.returnValue(Promise.resolve(token));

        spyOn(mockInstallationLinkSupplier, "get")
          .and.returnValue(Promise.resolve("http://ilias.de"));

        await expectAsync(subject.build())
          .toBeResolvedTo(`${installation}/goto.php?target=ilias_app_news|${user.iliasUserId}|${id}|${context}|${token}`);
      });
    });
  })
});
