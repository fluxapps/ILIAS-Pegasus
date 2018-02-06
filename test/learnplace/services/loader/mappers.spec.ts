import {SinonSandbox, createSandbox} from "sinon";
import {TextBlockMapper} from "../../../../src/learnplace/services/loader/mappers";
import {TextBlock} from "../../../../src/learnplace/providers/rest/learnplace.pojo";
import {TextblockEntity} from "../../../../src/learnplace/entity/textblock.entity";
import {apply} from "../../../../src/util/util.function";
import {getVisibilityEntity} from "./learnplace.spec";

describe("a text block mapper", () => {

  const sandbox: SinonSandbox = createSandbox();

  let mapper: TextBlockMapper = new TextBlockMapper();

	beforeEach(() => {
		mapper = new TextBlockMapper();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("on mapping text blocks", () => {

		context("on new text blocks", () => {

			it("should create new text block entities", () => {

			  const local: Array<TextblockEntity> = [];

				const remote: Array<TextBlock> = [
          <TextBlock>{sequence: 1, visibility: "ALWAYS",  content: "some text"},
          <TextBlock>{sequence: 2, visibility: "NEVER", content: "new text"}
        ];


        const result: Array<TextblockEntity> = mapper.map(local, remote);


        const expected: Array<TextblockEntity> = [
          apply(new TextblockEntity(), it => {
            it.sequence = 1;
            it.content = "some text";
            it.visibility = getVisibilityEntity("ALWAYS");
          }),
          apply(new TextblockEntity(), it => {
            it.sequence = 2;
            it.content = "new text";
            it.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing textblocks", () => {

			it("should update the existing ones", () => {

        const local: Array<TextblockEntity> = [
          apply(new TextblockEntity(), it => {
            it.id = 1;
            it.sequence = 1;
            it.content = "some text";
            it.visibility = getVisibilityEntity("ALWAYS");
          })
        ];

        const remote: Array<TextBlock> = [
          <TextBlock>{sequence: 1, visibility: "NEVER",  content: "some text"},
          <TextBlock>{sequence: 2, visibility: "NEVER", content: "new text"}
        ];


        const result: Array<TextblockEntity> = mapper.map(local, remote);


        const expected: Array<TextblockEntity> = [
          apply(new TextblockEntity(), it => {
            it.id = 1;
            it.sequence = 1;
            it.content = "some text";
            it.visibility = getVisibilityEntity("NEVER");
          }),
          apply(new TextblockEntity(), it => {
            it.sequence = 2;
            it.content = "new text";
            it.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});
