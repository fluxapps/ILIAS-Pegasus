import {SinonSandbox, createSandbox} from "sinon";
import * as chaiAsPromised from "chai-as-promised";
import {IllegalStateError} from "../../../src/error/errors";
import {LoginLinkBuilder, LoginLinkBuilderImpl} from "../../../src/services/link/login.builder";

chai.use(chaiAsPromised);

describe("A login link builder ", () => {

  const sandbox: SinonSandbox = createSandbox();

  let subject: LoginLinkBuilder = new LoginLinkBuilderImpl();

  beforeEach(() => {
    subject = new LoginLinkBuilderImpl();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("building a link", () => {

    context("without a installation url", () => {

      it("should throw an illegal state error.", () => {

        subject.clientId("default");

        chai.expect(() => subject.build())
          .to.throw(IllegalStateError)
          .to.have.property("message", "Required installation was not found, ILIAS login link build failed.");
      });
    });

    context("without a client id", () => {

      it("should throw an illegal state error.", () => {

        subject.installation("https://ilias.de");

        chai.expect(() => subject.build())
          .throws(IllegalStateError)
          .to.have.property("message", "Required client id was not found, ILIAS login link build failed.");
      });
    });

    context("with a provided installation id and url", () => {

      it("should build the ILIAS login page link.", () => {

        const url: string = "https://ilias.de";
        const clientId: string = "default";

        subject
          .installation(url)
          .clientId(clientId);


        chai.expect(subject.build())
          .to.be.equal(`${url}/login.php?target=ilias_app_login_page&client_id=${clientId}`);
      });
    });
  })
});
