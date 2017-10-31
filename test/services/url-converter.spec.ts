import * as chai from "chai";
import {ILIASLink, ILIASLinkBuilder, ILIASLinkView} from "../../src/services/url-converter.service";
import {Error} from "tslint/lib/error";

describe("an ILIAS link builder", () => {

  describe("on a link to build", () => {

    context("on a valid link", () => {

      // Arrange
      const builder: ILIASLinkBuilder = new ILIASLinkBuilder("http://example.com/goto.php?target=course_1");

      // Act
      const link: ILIASLink = builder.build();

      it("should return the built ILIAS link", () => {
        const expected: ILIASLink = new ILIASLink("http://example.com", 1, ILIASLinkView.DEFAULT);
        chai.expect(link)
          .to.deep.equal(expected);
      })
    });

    context("on a invalid link", () => {

      // Arrange
      const builder: ILIASLinkBuilder = new ILIASLinkBuilder("http://example.com"); // missing ref id

      // Act
      it("should throw an Error", () => {
        chai.expect(() => { builder.build() })
          .to.throw(Error, "Can not build link: url does not match regex, url=http://example.com")
      });
    });
  });
});

