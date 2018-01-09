import {RestLearnplaceLoader} from "../../../src/learnplace/services/learnplace";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {LearnplaceAPI} from "../../../src/learnplace/providers/rest/learnplace.api";
import {BlockObject, JournalEntry, LearnPlace} from "../../../src/learnplace/providers/rest/learnplace.pojo";
import {LearnplaceRepository} from "../../../src/learnplace/providers/repository/learnplace.repository";
import {LearnplaceEnity} from "../../../src/learnplace/entity/learnplace.enity";
import {Optional} from "../../../src/util/util.optional";
import * as chaiAsPromised from "chai-as-promised";
import {MapEntity} from "../../../src/learnplace/entity/map.entity";
import {LocationEntity} from "../../../src/learnplace/entity/location.entity";
import {VisibilityEntity} from "../../../src/learnplace/entity/visibility.entity";

chai.use(chaiAsPromised);

describe("a learnplace loader", () => {

    const sandbox: SinonSandbox = createSandbox();

    const mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
      getBlocks: (): Promise<BlockObject> => undefined,
      getJournalEntries: (): Promise<Array<JournalEntry>> => undefined,
      getLearnPlace: (): Promise<LearnPlace> => undefined
    };
    const mockLearnplaceRepository: LearnplaceRepository = <LearnplaceRepository>{
      save: (): Promise<LearnplaceEnity> => undefined,
      find: (): Promise<Optional<LearnplaceEnity>> => undefined,
      delete: (): Promise<void> => undefined
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

        const learnplace: LearnPlace = <LearnPlace>{
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
        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .resolves(learnplace);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.empty());

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEnity()); // return value is not used, therefore an empty entity is enough


        await loader.load(1);


        const expected: LearnplaceEnity = createLearnplace(learnplace);
        assert.calledWith(saveStub, expected)
			});
		});

		context("on existing learnplace", () => {

			it("should update the existing learnplace and its relations", async() => {

        const learnplace: LearnPlace = <LearnPlace>{
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
        sandbox.stub(mockLearnplaceAPI, "getLearnPlace")
          .resolves(learnplace);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.of(getExistingLearnplace()));

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEnity()); // return value is not used, therefore an empty entity is enough


        await loader.load(1);


        const expected: LearnplaceEnity = updateLearnplace(getExistingLearnplace(), learnplace);
        assert.calledWith(saveStub, expected)
			})
		});
	});
});

function createLearnplace(learnplace: LearnPlace): LearnplaceEnity {

  const learnplaceEnity: LearnplaceEnity = new LearnplaceEnity();
  learnplaceEnity.objectId = learnplace.objectId;

  const visibilityEntity: VisibilityEntity = new VisibilityEntity();
  visibilityEntity.value = learnplace.map.visibility;

  const mapEntity: MapEntity = new MapEntity();
  mapEntity.visibility = visibilityEntity;

  const locationEntity: LocationEntity = new LocationEntity();
  locationEntity.latitude = learnplace.location.latitude;
  locationEntity.longitude = learnplace.location.longitude;
  locationEntity.radius = learnplace.location.radius;
  locationEntity.elevation = learnplace.location.elevation;

  learnplaceEnity.map = mapEntity;
  learnplaceEnity.location = locationEntity;

  return learnplaceEnity;
}

function getExistingLearnplace(): LearnplaceEnity {

  const learnplaceEnity: LearnplaceEnity = new LearnplaceEnity();
  learnplaceEnity.objectId = 1;

  const visibilityEntity: VisibilityEntity = new VisibilityEntity();
  visibilityEntity.value = "NEVER";

  const mapEntity: MapEntity = new MapEntity();
  mapEntity.id = 1;
  mapEntity.visibility = visibilityEntity;

  const locationEntity: LocationEntity = new LocationEntity();
  locationEntity.id = 1;
  locationEntity.latitude = 40.054896;
  locationEntity.longitude = 10.584896;
  locationEntity.radius = 20;
  locationEntity.elevation = 15.54;

  learnplaceEnity.map = mapEntity;
  learnplaceEnity.location = locationEntity;

  return learnplaceEnity;
}

function updateLearnplace(entity: LearnplaceEnity, learnplace: LearnPlace): LearnplaceEnity {

  entity.map.visibility.value = learnplace.map.visibility;

  entity.location.latitude = learnplace.location.latitude;
  entity.location.longitude = learnplace.location.longitude;
  entity.location.radius = learnplace.location.radius;
  entity.location.elevation = learnplace.location.elevation;

  return entity;
}
