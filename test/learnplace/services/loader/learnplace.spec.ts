import {LearnplaceLoadingError, RestLearnplaceLoader} from "../../../../src/learnplace/services/loader/learnplace";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {LearnplaceAPI} from "../../../../src/learnplace/providers/rest/learnplace.api";
import {BlockObject, JournalEntry, LearnPlace} from "../../../../src/learnplace/providers/rest/learnplace.pojo";
import {LearnplaceRepository} from "../../../../src/learnplace/providers/repository/learnplace.repository";
import {LearnplaceEntity} from "../../../../src/learnplace/entity/learnplace.entity";
import {Optional} from "../../../../src/util/util.optional";
import * as chaiAsPromised from "chai-as-promised";
import {MapEntity} from "../../../../src/learnplace/entity/map.entity";
import {LocationEntity} from "../../../../src/learnplace/entity/location.entity";
import {VisibilityEntity} from "../../../../src/learnplace/entity/visibility.entity";
import {apply} from "../../../../src/util/util.function";
import {HttpRequestError} from "../../../../src/providers/http";
import {PictureBlockMapper, TextBlockMapper} from "../../../../src/learnplace/services/loader/mappers";
import {stubInstance} from "../../../SinonUtils";

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
    const mockTextBlockMapper: TextBlockMapper = stubInstance(TextBlockMapper);
    const mockPictureBlockMapper: PictureBlockMapper = stubInstance(PictureBlockMapper);

    let loader: RestLearnplaceLoader = new RestLearnplaceLoader(
      mockLearnplaceAPI,
      mockLearnplaceRepository,
      mockTextBlockMapper,
      mockPictureBlockMapper
    );

	beforeEach(() => {
		loader = new RestLearnplaceLoader(
		  mockLearnplaceAPI,
      mockLearnplaceRepository,
      mockTextBlockMapper,
      mockPictureBlockMapper
    );
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

        const blocks: BlockObject = createEmptyBlocks(); // we don't care about the blocks in this class
        sandbox.stub(mockLearnplaceAPI, "getBlocks")
          .resolves(blocks);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.empty());

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEntity()); // return value is not used, therefore an empty entity is enough

        // again, we don't care about the blocks, therefore we return empty arrays
        const textBlockMapperStub: SinonStub = sandbox.stub(mockTextBlockMapper, "map")
          .returns([]);
        const pictureBlockMapperStub: SinonStub = sandbox.stub(mockPictureBlockMapper, "map")
          .returns([]);


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
          it.textBlocks = [];
          it.pictureBlocks = [];
        });
        assert.calledWith(saveStub, expected);

        assert.calledOnce(textBlockMapperStub);
        assert.calledOnce(pictureBlockMapperStub);
			});
		});

		context("on existing learnplace", () => {

			it("should update the existing learnplace and its relations", async() => {

        const learnplace: LearnPlace = createLearnPlace();
        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .resolves(learnplace);

        const blocks: BlockObject = createEmptyBlocks(); // we don't care about the blocks in this class
        sandbox.stub(mockLearnplaceAPI, "getBlocks")
          .resolves(blocks);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.of(getExistingLearnplace()));

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEntity()); // return value is not used, therefore an empty entity is enough

        // again, we don't care about the blocks, therefore we return empty arrays
        const textBlockMapperStub: SinonStub = sandbox.stub(mockTextBlockMapper, "map")
          .returns([]);
        const pictureBlockMapperStub: SinonStub = sandbox.stub(mockPictureBlockMapper, "map")
          .returns([]);


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
          it.textBlocks = [];
          it.pictureBlocks = [];
        });
        assert.calledWith(saveStub, expected);

        assert.calledOnce(textBlockMapperStub);
        assert.calledOnce(pictureBlockMapperStub);
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

function createEmptyBlocks(): BlockObject {
  return <BlockObject>{
    text: [],
    picture: [],
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

    it.textBlocks = [];
    it.pictureBlocks = [];
  });
}

export function getVisibilityEntity(visibility: string): VisibilityEntity {
  return apply(new VisibilityEntity(), it => {
    it.value = visibility;
  });
}
