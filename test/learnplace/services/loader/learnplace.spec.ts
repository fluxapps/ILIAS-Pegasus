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
import {HttpRequestError} from "../../../../src/providers/http";
import {
  AccordionMapper,
  LinkBlockMapper, PictureBlockMapper, TextBlockMapper, VideoBlockMapper,
  VisitJournalMapper
} from "../../../../src/learnplace/services/loader/mappers";
import {stubInstance} from "../../../SinonUtils";

chai.use(chaiAsPromised);

describe("a learnplace loader", () => {

    const sandbox: SinonSandbox = createSandbox();

    const mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
      getBlocks: (): Promise<BlockObject> => undefined,
      getJournalEntries: (): Promise<Array<JournalEntry>> => undefined,
      getLearnPlace: (): Promise<LearnPlace> => undefined,
      addJournalEntry: (): Promise<void> => undefined
    };
    const mockLearnplaceRepository: LearnplaceRepository = <LearnplaceRepository>{
      save: (): Promise<LearnplaceEntity> => undefined,
      find: (): Promise<Optional<LearnplaceEntity>> => undefined,
      delete: (): Promise<void> => undefined,
      exists: (): Promise<boolean> => undefined
    };
    const mockTextBlockMapper: TextBlockMapper = stubInstance(TextBlockMapper);
    const mockPictureBlockMapper: PictureBlockMapper = stubInstance(PictureBlockMapper);
    const mockLinkBlockMapper: LinkBlockMapper = stubInstance(LinkBlockMapper);
    const mockVideoBlockMapper: VideoBlockMapper = stubInstance(VideoBlockMapper);
    const mockAccordionMapper: AccordionMapper = stubInstance(AccordionMapper);
    const mockJournalEntryMapper: VisitJournalMapper = stubInstance(VisitJournalMapper);

    let loader: RestLearnplaceLoader = new RestLearnplaceLoader(
      mockLearnplaceAPI,
      mockLearnplaceRepository,
      mockTextBlockMapper,
      mockPictureBlockMapper,
      mockLinkBlockMapper,
      mockVideoBlockMapper,
      mockAccordionMapper,
      mockJournalEntryMapper
    );

	beforeEach(() => {
		loader = new RestLearnplaceLoader(
		  mockLearnplaceAPI,
      mockLearnplaceRepository,
      mockTextBlockMapper,
      mockPictureBlockMapper,
      mockLinkBlockMapper,
      mockVideoBlockMapper,
      mockAccordionMapper,
      mockJournalEntryMapper
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

        sandbox.stub(mockLearnplaceAPI, "getJournalEntries") // we don't care about the visit journal in this class
          .resolves([]);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.empty());

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEntity()); // return value is not used, therefore an empty entity is enough

        // again, we don't care about the blocks or visit journal, therefore we return empty arrays
        const textBlockMapperStub: SinonStub = sandbox.stub(mockTextBlockMapper, "map")
          .resolves([]);
        const pictureBlockMapperStub: SinonStub = sandbox.stub(mockPictureBlockMapper, "map")
          .resolves([]);
        const linkBlockMapperStub: SinonStub = sandbox.stub(mockLinkBlockMapper, "map")
          .resolves([]);
        const videoBlockMapperStub: SinonStub = sandbox.stub(mockVideoBlockMapper, "map")
          .resolves([]);
        const visitJournalMapperStub: SinonStub = sandbox.stub(mockJournalEntryMapper, "map")
          .resolves([]);
        const accordionMapperStub: SinonStub = sandbox.stub(mockAccordionMapper, "map")
          .resolves([]);


        await loader.load(1);


        const expected: LearnplaceEntity = new LearnplaceEntity().applies( function(): void {

          this.objectId = learnplace.objectId;
          this.map = new MapEntity().applies(function(): void {
            this.visibility = getVisibilityEntity(learnplace.map.visibility);
          });
          this.location = new LocationEntity().applies(function(): void {
            this.latitude = learnplace.location.latitude;
            this.longitude = learnplace.location.longitude;
            this.radius = learnplace.location.radius;
            this.elevation = learnplace.location.elevation;
          });

          this.visitJournal = [];
          this.textBlocks = [];
          this.pictureBlocks = [];
          this.linkBlocks = [];
          this.videoBlocks = [];
          this.accordionBlocks = [];
        });
        assert.calledWith(saveStub, expected);

        assert.calledOnce(textBlockMapperStub);
        assert.calledOnce(pictureBlockMapperStub);
        assert.calledOnce(linkBlockMapperStub);
        assert.calledOnce(videoBlockMapperStub);
        assert.calledOnce(visitJournalMapperStub);
        assert.calledOnce(accordionMapperStub);
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

        sandbox.stub(mockLearnplaceAPI, "getJournalEntries") // we don't care about the visit journal in this class
          .resolves([]);

        sandbox.stub(mockLearnplaceRepository, "find")
          .resolves(Optional.of(getExistingLearnplace()));

        const saveStub: SinonStub = sandbox.stub(mockLearnplaceRepository, "save")
          .resolves(new LearnplaceEntity()); // return value is not used, therefore an empty entity is enough

        // again, we don't care about the blocks or visit journal, therefore we return empty arrays
        const textBlockMapperStub: SinonStub = sandbox.stub(mockTextBlockMapper, "map")
          .resolves([]);
        const pictureBlockMapperStub: SinonStub = sandbox.stub(mockPictureBlockMapper, "map")
          .resolves([]);
        const linkBlockMapperStub: SinonStub = sandbox.stub(mockLinkBlockMapper, "map")
          .resolves([]);
        const videoBlockMapperStub: SinonStub = sandbox.stub(mockVideoBlockMapper, "map")
          .resolves([]);
        const visitJournalMapperStub: SinonStub = sandbox.stub(mockJournalEntryMapper, "map")
          .resolves([]);
        const accordionMapperStub: SinonStub = sandbox.stub(mockAccordionMapper, "map")
          .resolves([]);


        await loader.load(1);


        // we set now an id on the entities that exists already
        const expected: LearnplaceEntity = new LearnplaceEntity().applies(function(): void {

          this.objectId = learnplace.objectId;
          this.map = new MapEntity().applies(function(): void {
            this.id = 1;
            this.visibility = getVisibilityEntity(learnplace.map.visibility);
          });
          this.location = new LocationEntity().applies(function(): void {
            this.id = 1;
            this.latitude = learnplace.location.latitude;
            this.longitude = learnplace.location.longitude;
            this.radius = learnplace.location.radius;
            this.elevation = learnplace.location.elevation;
          });

          this.visitJournal = [];
          this.textBlocks = [];
          this.pictureBlocks = [];
          this.linkBlocks = [];
          this.videoBlocks = [];
          this.accordionBlocks = [];
        });
        assert.calledWith(saveStub, expected);

        assert.calledOnce(textBlockMapperStub);
        assert.calledOnce(pictureBlockMapperStub);
        assert.calledOnce(linkBlockMapperStub);
        assert.calledOnce(videoBlockMapperStub);
        assert.calledOnce(visitJournalMapperStub);
        assert.calledOnce(accordionMapperStub);
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

  return new LearnplaceEntity().applies(function(): void {

    this.objectId = 1;

    this.map = new MapEntity().applies(function(): void {
      this.id = 1;
      this.visibility = getVisibilityEntity("ALWAYS")
    });

    this.location = new LocationEntity().applies(function(): void {
      this.id = 1;
      this.latitude = 40.054896;
      this.longitude = 10.584896;
      this.radius = 20;
      this.elevation = 15.54;
    });

    this.textBlocks = [];
    this.pictureBlocks = [];
    this.videoBlocks = [];
    this.linkBlocks = [];
    this.visitJournal = [];
    this.accordionBlocks = [];
  });
}

export function getVisibilityEntity(visibility: string): VisibilityEntity {
  return new VisibilityEntity().applies(function(): void {
    this.value = visibility;
  });
}
