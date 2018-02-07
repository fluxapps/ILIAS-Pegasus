import {SinonSandbox, createSandbox, SinonStub, stub, assert} from "sinon";
import {VisibilityManagedBlockService} from "../../../src/learnplace/services/block.service";
import {LearnplaceRepository} from "../../../src/learnplace/providers/repository/learnplace.repository";
import {
  VisibilityContext,
  VisibilityContextFactory
} from "../../../src/learnplace/services/visibility/visibility.context";
import {stubInstance} from "../../SinonUtils";
import {LearnplaceEntity} from "../../../src/learnplace/entity/learnplace.entity";
import {TextblockEntity} from "../../../src/learnplace/entity/textblock.entity";
import {VisibilityStrategyType} from "../../../src/learnplace/services/visibility/visibility.strategy";
import {VisibilityEntity} from "../../../src/learnplace/entity/visibility.entity";
import {BlockModel, PictureBlockModel, TextBlockModel} from "../../../src/learnplace/services/block.model";
import {Optional} from "../../../src/util/util.optional";
import * as chaiAsPromised from "chai-as-promised";
import {NoSuchElementError} from "../../../src/error/errors";
import {PictureBlockEntity} from "../../../src/learnplace/entity/pictureBlock.entity";

chai.use(chaiAsPromised);

describe("a block service", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockLearnplaceRepo: LearnplaceRepository = <LearnplaceRepository>{
    save: () => undefined,
    find: () => undefined,
    delete: () => undefined
  };
  const mockContextFactory: VisibilityContextFactory = stubInstance(VisibilityContextFactory);

  let blockService: VisibilityManagedBlockService = new VisibilityManagedBlockService(mockLearnplaceRepo, mockContextFactory);

	beforeEach(() => {
		blockService = new VisibilityManagedBlockService(mockLearnplaceRepo, mockContextFactory);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("a block array to get", () => {

		context("on loading all blocks", () => {

			it("should return an ordered array of all block types", async() => {

			  const textBlock1: TextblockEntity = createTextblockEntity(1, "some text", 1, VisibilityStrategyType.ALWAYS);
			  const textBlock2: TextblockEntity = createTextblockEntity(2, "other text", 2, VisibilityStrategyType.NEVER);

			  const pictureBlock1: PictureBlockEntity = createPictureblockEntity(
			    1, 3, "title", "description",
          "thumbnail", "url", VisibilityStrategyType.NEVER);
        const pictureBlock2: PictureBlockEntity = createPictureblockEntity(
          1, 4, "other title", "other description",
          "other thumbnail", "other url", VisibilityStrategyType.NEVER);

        const learplaceEntity: LearnplaceEntity = new LearnplaceEntity();
        learplaceEntity.textBlocks = [textBlock2, textBlock1];
        learplaceEntity.pictureBlocks = [pictureBlock1, pictureBlock2];

        sandbox.stub(mockLearnplaceRepo, "find")
          .resolves(Optional.of(learplaceEntity));

        const alwaysStub: SinonStub = stub();
        const neverStub: SinonStub = stub();
        sandbox.stub(mockContextFactory, "create")
          .withArgs(VisibilityStrategyType.NEVER)
          .returns(<VisibilityContext>{
            use: neverStub
          })
          .withArgs(VisibilityStrategyType.ALWAYS)
          .returns(<VisibilityContext>{
            use: alwaysStub
          });


        const result: Array<BlockModel> = await blockService.getBlocks(1);


        assert.calledOnce(alwaysStub);
        assert.calledThrice(neverStub);

        const expected: Array<BlockModel> = [
          new TextBlockModel(1, "some text"),
          new TextBlockModel(2, "other text"),
          new PictureBlockModel(3, "title", "description", "thumbnail", "url"),
          new PictureBlockModel(4, "other title", "other description", "other thumbnail", "other url")
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on no learnplace available", () => {

			it("should throw a no such element error", (done) => {

				sandbox.stub(mockLearnplaceRepo, "find")
          .resolves(Optional.empty());

				chai.expect(blockService.getBlocks(1))
          .rejectedWith(NoSuchElementError)
          .and.eventually.to.have.property("message", "No learnplace found: id=1")
          .notify(done);
			})
		});
	});
});

function createTextblockEntity(id: number, content: string, sequence: number, visibility: VisibilityStrategyType): TextblockEntity {

  const block: TextblockEntity = new TextblockEntity();
  block.id = id;
  block.content = content;
  block.sequence = sequence;
  block.visibility = createVisibilityEntity(visibility);

  return block;
}

function createPictureblockEntity(
  id: number,
  sequence: number,
  title: string,
  description: string,
  thumbnail: string,
  url: string,
  visibility: VisibilityStrategyType
): PictureBlockEntity {

  const block: PictureBlockEntity = new PictureBlockEntity();
  block.id = id;
  block.sequence = sequence;
  block.title = title;
  block.description = description;
  block.thumbnail = thumbnail;
  block.url = url;
  block.visibility = createVisibilityEntity(visibility);

  return block;
}

function createVisibilityEntity(strategy: VisibilityStrategyType): VisibilityEntity {

  const visibilityEntity: VisibilityEntity = new VisibilityEntity();

  switch(strategy) {
    case VisibilityStrategyType.ALWAYS:
      visibilityEntity.value = "ALWAYS";
      break;
    case VisibilityStrategyType.NEVER:
      visibilityEntity.value = "NEVER";
      break;
    case VisibilityStrategyType.AFTER_VISIT_PLACE:
      visibilityEntity.value = "AFTER_VISIT_PLACE";
      break;
    case VisibilityStrategyType.ONLY_AT_PLACE:
      visibilityEntity.value = "ONLY_AT_PLACE";
      break;
    default:
      throw new Error(`Visibility is not supported: ${strategy}`);
  }

  return visibilityEntity;
}
