import {SinonSandbox, createSandbox, SinonStub, stub, assert} from "sinon";
import {VisibilityManagedBlockService} from "../../../src/learnplace/services/block.service";
import {LearnplaceRepository} from "../../../src/learnplace/providers/repository/learnplace.repository";
import {
  VisibilityContext,
  VisibilityContextFactory
} from "../../../src/learnplace/services/visibility/visibility.context";
import {stubInstance} from "../../SinonUtils";
import {LearnplaceEnity} from "../../../src/learnplace/entity/learnplace.enity";
import {TextblockEntity} from "../../../src/learnplace/entity/textblock.entity";
import {VisibilityStrategyType} from "../../../src/learnplace/services/visibility/visibility.strategy";
import {VisibilityEntity} from "../../../src/learnplace/entity/visibility.entity";
import {BlockModel, TextBlockModel} from "../../../src/learnplace/page.model";

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

        const learplaceEntity: LearnplaceEnity = new LearnplaceEnity();
        learplaceEntity.textBlocks = [textBlock2, textBlock1];

        sandbox.stub(mockLearnplaceRepo, "find")
          .resolves(learplaceEntity);

        const alwaysStub: SinonStub = stub();
        const neverStub: SinonStub = stub();
        sandbox.stub(mockContextFactory, "create")
          .withArgs(VisibilityStrategyType.ALWAYS)
          .onFirstCall()
          .returns(<VisibilityContext>{
            use: alwaysStub
          })
          .withArgs(VisibilityStrategyType.NEVER)
          .onSecondCall()
          .returns(<VisibilityContext>{
            use: neverStub
          });


        const result: Array<BlockModel> = await blockService.getBlocks(1);


        assert.calledOnce(alwaysStub);
        assert.calledOnce(neverStub);

        const expected: Array<BlockModel> = [
          new TextBlockModel(1, 1, "some text"),
          new TextBlockModel(2, 2, "other text")
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			});
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
