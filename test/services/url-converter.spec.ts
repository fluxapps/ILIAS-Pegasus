import {ILIASLink, ILIASLinkBuilder, ILIASLinkView} from "../../src/services/url-converter.service";

describe("an ILIAS link builder", () => {

  describe("on a link to build", () => {

    context("on a valid link", () => {

      it("should return the built ILIAS link", () => {

        // Arrange
        const builder: ILIASLinkBuilder = new ILIASLinkBuilder("http://example.com/goto.php?target=course_1");

        // Act
        const link: ILIASLink = builder.build();

        // Assert
        const expected: ILIASLink = new ILIASLink("http://example.com", 1, ILIASLinkView.DEFAULT);
        chai.expect(link)
          .to.deep.equal(expected);
      })
    });

    context("on an invalid link", () => {

      it("should throw an Error", () => {

        // Arrange
        const builder: ILIASLinkBuilder = new ILIASLinkBuilder("http://example.com"); // missing ref id

        // Act
        const link: () => ILIASLink = (): ILIASLink => builder.build();

        // Assert
        chai.expect(link)
          .to.throw(Error, "Can not build link: url does not match regex, url=http://example.com")
      });
    });
  });
});

