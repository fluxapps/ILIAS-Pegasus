import {LearnplaceLoadingError, RestLearnplaceLoader} from "../../../src/learnplace/services/learnplace";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {LearnplaceAPI} from "../../../src/learnplace/providers/rest/learnplace.api";
import {
  Block, BlockObject, JournalEntry, LearnPlace, PictureBlock,
  TextBlock
} from "../../../src/learnplace/providers/rest/learnplace.pojo";
import {LearnplaceRepository} from "../../../src/learnplace/providers/repository/learnplace.repository";
import {LearnplaceEntity} from "../../../src/learnplace/entity/learnplace.entity";
import {Optional} from "../../../src/util/util.optional";
import * as chaiAsPromised from "chai-as-promised";
import {MapEntity} from "../../../src/learnplace/entity/map.entity";
import {LocationEntity} from "../../../src/learnplace/entity/location.entity";
import {VisibilityEntity} from "../../../src/learnplace/entity/visibility.entity";
import {apply} from "../../../src/util/util.function";
import {TextblockEntity} from "../../../src/learnplace/entity/textblock.entity";
import {HttpRequestError} from "../../../src/providers/http";

chai.use(chaiAsPromised);

describe("a learnplace loader", () => {

    const sandbox: SinonSandbox = createSandbox();

    const mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
      getBlocks: (): Promise<BlockObject> => undefined,
      getJournalEntries: (): Promise<Array<JournalEntry>> => undefined,
      getLearnPlace: (): Promise<LearnPlace> => undefined
    };
    const mockLearnplaceRepository: LearnplaceRepository = <LearnplaceRepository>{
      save: (): Promise<LearnplaceEntity> => undefined,
      find: (): Promise<Optional<LearnplaceEntity>> => undefined,
      delete: (): Promise<void> => undefined,
      exists: (): Promise<boolean> => undefined
    };

    let loader: RestLearnplaceLoader = new RestLearnplaceLoader(mockLearnplaceAPI, mockLearnplaceRepository);

	beforeEach(() => {
		loader = new RestLearnplaceLoader(mockLearnplaceAPI, mockLearnplaceRepository)
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("a learnplace to load", () => {

		context("on new learnplace", () => {

			it("should create the learnplace and its relations", async() => {

			  const learnplace: LearnPlace = createLearnPlace();
        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .resolves(learnplace);

        const blocks: BlockObject = createBlocks();
        sandbox.stub(mockLearnplaceAPI, "getBlocks")
          .resolves(blocks);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.empty());

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEntity()); // return value is not used, therefore an empty entity is enough


        await loader.load(1);


        const expected: LearnplaceEntity = apply(new LearnplaceEntity(), it => {

          it.objectId = learnplace.objectId;
          it.map = apply(new MapEntity(), map => {
            map.visibility = getVisibilityEntity(learnplace.map.visibility);
          });
          it.location = apply(new LocationEntity(), location => {
            location.latitude = learnplace.location.latitude;
            location.longitude = learnplace.location.longitude;
            location.radius = learnplace.location.radius;
            location.elevation = learnplace.location.elevation;
          });
          it.textBlocks = [
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
          it.pictureBlocks = [];
        });
        assert.calledWith(saveStub, expected)
			});
		});

		context("on existing learnplace", () => {

			it("should update the existing learnplace and its relations", async() => {

        const learnplace: LearnPlace = createLearnPlace();
        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .resolves(learnplace);

        const blocks: BlockObject = createBlocks();
        sandbox.stub(mockLearnplaceAPI, "getBlocks")
          .resolves(blocks);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.of(getExistingLearnplace()));

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEntity()); // return value is not used, therefore an empty entity is enough


        await loader.load(1);


        // we set now an id on the entities that exists already
        const expected: LearnplaceEntity = apply(new LearnplaceEntity(), it => {

          it.objectId = learnplace.objectId;
          it.map = apply(new MapEntity(), it => {
            it.id = 1;
            it.visibility = getVisibilityEntity(learnplace.map.visibility);
          });
          it.location = apply(new LocationEntity(), it => {
            it.id = 1;
            it.latitude = learnplace.location.latitude;
            it.longitude = learnplace.location.longitude;
            it.radius = learnplace.location.radius;
            it.elevation = learnplace.location.elevation;
          });
          it.textBlocks = [
            apply(new TextblockEntity(), it => {
              it.id = 1;
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
          it.pictureBlocks = [];
        });
        assert.calledWith(saveStub, expected)
			})
		});

		context("on http request error", () => {

			it("it should throw an learnplace loading error", async() => {

        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .callsFake(() => Promise.reject(new HttpRequestError(500, "")));

        sandbox.stub(mockLearnplaceRepository, "exists")
          .resolves(false);


        await chai.expect(loader.load(1))
          .to.be.rejectedWith(LearnplaceLoadingError)
          .and.eventually.have.property("message", 'Could not load learnplace with id "1" over http connection');
			})
		});

		context("on http request error with existing learnplace", () => {

			it("should not save any learnplace data", async() => {

        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .callsFake(() => Promise.reject(new HttpRequestError(500, "")));

        sandbox.stub(mockLearnplaceRepository, "exists")
          .resolves(true);

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save");


        await loader.load(1);


        assert.notCalled(saveStub);
			})
		});
	});
});

function createLearnPlace(): LearnPlace {

  return <LearnPlace>{
    objectId: 24,
    location: {
      latitude: 47.059819,
      longitude: 7.623976,
      elevation: 10.05,
      radius: 15
    },
    map: {
      visibility: "ALWAYS"
    }
  };
}

function createBlocks(): BlockObject {
  return <BlockObject>{
    text: [
      <TextBlock>{sequence: 1, visibility: "ALWAYS",  content: "some text"},
      <TextBlock>{sequence: 2, visibility: "NEVER", content: "new text"}
    ],
    picture: [
      <PictureBlock>{sequence: 3, visibility: "ALWAYS", title: "title", description: "", thumbnail: "", url: "get/picture/1"}
    ],
    video: [],
    iliasLink: [],
    accordion: []
  };
}

function getExistingLearnplace(): LearnplaceEntity {

  return apply(new LearnplaceEntity(), it => {

    it.objectId = 1;

    it.map = apply(new MapEntity(), it => {
      it.id = 1;
      it.visibility = getVisibilityEntity("ALWAYS")
    });

    it.location = apply(new LocationEntity(), it => {
      it.id = 1;
      it.latitude = 40.054896;
      it.longitude = 10.584896;
      it.radius = 20;
      it.elevation = 15.54;
    });

    it.textBlocks = [
      apply(new TextblockEntity(), it => {
        it.id = 1;
        it.sequence = 1;
        it.content = "some text";
        it.visibility = getVisibilityEntity("NEVER");
      })
    ];

    it.pictureBlocks = [];
  });
}

function getVisibilityEntity(visibility: string): VisibilityEntity {
  return apply(new VisibilityEntity(), it => {
    it.value = visibility;
  });
}
