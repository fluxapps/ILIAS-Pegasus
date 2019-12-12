import {IllegalStateError} from "../../error/errors";
import {LoginLinkBuilder, LoginLinkBuilderImpl} from "./login.builder";

describe("A login link builder ", () => {

  let subject: LoginLinkBuilder = new LoginLinkBuilderImpl();

  beforeEach(() => {
    subject = new LoginLinkBuilderImpl();
  });

  describe("building a link", () => {

    describe("without a installation url", () => {

      it("should throw an illegal state error.", () => {

        subject.clientId("default");

        expect(() => subject.build())
          .toThrowError(IllegalStateError, "Required installation was not found, ILIAS login link build failed.");
      });
    });

    describe("without a client id", () => {

      it("should throw an illegal state error.", () => {

        subject.installation("https://ilias.de");

        expect(() => subject.build())
          .toThrowError(IllegalStateError, "Required client id was not found, ILIAS login link build failed.");
      });
    });

    describe("with a provided installation id and url", () => {

      it("should build the ILIAS login page link.", () => {

        const url: string = "https://ilias.de";
        const clientId: string = "default";

        subject
          .installation(url)
          .clientId(clientId);


        expect(subject.build())
          .toEqual(`${url}/login.php?target=ilias_app_login_page&client_id=${clientId}`);
      });
    });
  })
});
