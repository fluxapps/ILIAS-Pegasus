import {SinonSandbox, createSandbox} from "sinon";
import * as chaiAsPromised from "chai-as-promised";
import {UserEntity} from "../../../src/entity/user.entity";
import {InstallationLinkSupplier, TokenSupplier} from "../../../src/services/link/link-builder.supplier";
import {Optional} from "../../../src/util/util.optional";
import {UserRepository} from "../../../src/providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../../src/error/errors";
import {NewsLinkBuilder, NewsLinkBuilderImpl} from "../../../src/services/link/news.builder";

chai.use(chaiAsPromised);

describe("A news link builder ", () => {

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

  let subject: NewsLinkBuilder = new NewsLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);

  beforeEach(() => {
    subject = new NewsLinkBuilderImpl(mockInstallationLinkSupplier, mockTokenSupplier, mockUserRepository);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("building a link", () => {

    context("without a news id", () => {

      it("should throw an illegal state error.", async() => {

        await chai.expect(subject.build())
          .to.be.rejectedWith(IllegalStateError)
          .to.eventually.have.property("message", "Required news id was not found, ILIAS news link build failed.");
      });
    });

    context("without a news context id", () => {

      it("should throw an illegal state error.", async() => {

        const id: number = 15;
        subject.newsId(id);

        await chai.expect(subject.build())
          .to.be.rejectedWith(IllegalStateError)
          .to.eventually.have.property("message", "Required news context id was not found, ILIAS news link build failed.");
      });
    });

    context("without an authenticated user", () => {

      it("should throw a no such element error.", async() => {

        const id: number = 15;
        const context: number = 15;
        subject.newsId(id);
        subject.context(context);

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.empty());

        await chai.expect(subject.build())
          .to.be.rejectedWith(NoSuchElementError)
          .to.eventually.have.property("message", "No authenticated user found, unable to build news ILIAS link.");
      });
    });

    context("with an authenticated user and a valid news id and context", () => {

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

        sandbox.stub(mockUserRepository, "findAuthenticatedUser")
          .resolves(Optional.of(user));

        sandbox.stub(mockTokenSupplier, "get")
          .resolves(token);

        sandbox.stub(mockInstallationLinkSupplier, "get")
          .resolves("http://ilias.de");

        await chai.expect(subject.build())
          .to.be.eventually.equal(`${installation}/goto.php?target=ilias_app_news|${user.iliasUserId}|${id}|${context}|${token}`);
      });
    });
  })
});
