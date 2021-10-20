import {createSpyObject} from "../../../../test.util.spec";
import {LearnplaceLoadingError, RestLearnplaceLoader} from "./learnplace";
import {LearnplaceAPI} from "../../../providers/learnplace/rest/learnplace.api";
import {BlockObject, JournalEntry, LearnPlace} from "../../../providers/learnplace/rest/learnplace.pojo";
import {LearnplaceRepository} from "../../../providers/learnplace/repository/learnplace.repository";
import {LearnplaceEntity, MapEntity, LocationEntity} from "../../../entity/learnplace/learnplace.entity";
import {Optional} from "../../../util/util.optional";
import {VisibilityEntity} from "../../../entity/learnplace/visibility.entity";
import {HttpRequestError} from "../../../providers/http";
import {
    AccordionMapper,
    LinkBlockMapper, PictureBlockMapper, TextBlockMapper, VideoBlockMapper,
    VisitJournalMapper
} from "./mappers";
import {UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";

describe("a learnplace loader", () => {

    let mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
        getBlocks: (): Promise<BlockObject> => Promise.reject(new Error("This method is mocked")),
        getJournalEntries: (): Promise<Array<JournalEntry>> => Promise.reject(new Error("This method is mocked")),
        getLearnPlace: (): Promise<LearnPlace> => Promise.reject(new Error("This method is mocked")),
        addJournalEntry: (): Promise<void> => Promise.reject(new Error("This method is mocked"))
    };
    let mockLearnplaceRepository: LearnplaceRepository = <LearnplaceRepository>{
        save: (): Promise<LearnplaceEntity> => Promise.reject(new Error("This method is mocked")),
        find: (): Promise<Optional<LearnplaceEntity>> => Promise.reject(new Error("This method is mocked")),
        delete: (): Promise<void> => Promise.reject(new Error("This method is mocked")),
        exists: (): Promise<boolean> => Promise.reject(new Error("This method is mocked")),
        findByObjectIdAndUserId: (): Promise<Optional<LearnplaceEntity>> => Promise.reject(new Error("This method is mocked"))
    };
    let mockUserRepository: UserRepository = <UserRepository>{
        findAuthenticatedUser: (): Promise<Optional<UserEntity>> => Promise.reject(new Error("This method is mocked")),
        find: (): Promise<Optional<UserEntity>> => Promise.reject(new Error("This method is mocked")),
        delete: (): Promise<void> => Promise.reject(new Error("This method is mocked")),
        exists: (): Promise<boolean> => Promise.reject(new Error("This method is mocked")),
        save: (): Promise<UserEntity> => Promise.reject(new Error("This method is mocked"))
    };
    let mockTextBlockMapper: jasmine.SpyObj<TextBlockMapper> = createSpyObject(TextBlockMapper);
    let mockPictureBlockMapper: jasmine.SpyObj<PictureBlockMapper> = createSpyObject(PictureBlockMapper);
    let mockLinkBlockMapper: jasmine.SpyObj<LinkBlockMapper> = createSpyObject(LinkBlockMapper);
    let mockVideoBlockMapper: jasmine.SpyObj<VideoBlockMapper> = createSpyObject(VideoBlockMapper);
    let mockAccordionMapper: jasmine.SpyObj<AccordionMapper> = createSpyObject(AccordionMapper);
    let mockJournalEntryMapper: jasmine.SpyObj<VisitJournalMapper> = createSpyObject(VisitJournalMapper);

    let loader: RestLearnplaceLoader = new RestLearnplaceLoader(
        mockLearnplaceAPI,
        mockLearnplaceRepository,
        mockUserRepository,
        mockTextBlockMapper,
        mockPictureBlockMapper,
        mockLinkBlockMapper,
        mockVideoBlockMapper,
        mockAccordionMapper,
        mockJournalEntryMapper
    );

    beforeEach(() => {
        mockLearnplaceAPI = <LearnplaceAPI>{
            getBlocks: (): Promise<BlockObject> => Promise.reject(new Error("This method is mocked")),
            getJournalEntries: (): Promise<Array<JournalEntry>> => Promise.reject(new Error("This method is mocked")),
            getLearnPlace: (): Promise<LearnPlace> => Promise.reject(new Error("This method is mocked")),
            addJournalEntry: (): Promise<void> => Promise.reject(new Error("This method is mocked"))
        };
        mockLearnplaceRepository = <LearnplaceRepository>{
            save: (): Promise<LearnplaceEntity> => Promise.reject(new Error("This method is mocked")),
            find: (): Promise<Optional<LearnplaceEntity>> => Promise.reject(new Error("This method is mocked")),
            delete: (): Promise<void> => Promise.reject(new Error("This method is mocked")),
            exists: (): Promise<boolean> => Promise.reject(new Error("This method is mocked")),
            findByObjectIdAndUserId: (): Promise<Optional<LearnplaceEntity>> => Promise.reject(new Error("This method is mocked"))
        };
        mockUserRepository = <UserRepository>{
            findAuthenticatedUser: (): Promise<Optional<UserEntity>> => Promise.reject(new Error("This method is mocked")),
            find: (): Promise<Optional<UserEntity>> => Promise.reject(new Error("This method is mocked")),
            delete: (): Promise<void> => Promise.reject(new Error("This method is mocked")),
            exists: (): Promise<boolean> => Promise.reject(new Error("This method is mocked")),
            save: (): Promise<UserEntity> => Promise.reject(new Error("This method is mocked"))
        };
        mockTextBlockMapper = createSpyObject(TextBlockMapper);
        mockPictureBlockMapper = createSpyObject(PictureBlockMapper);
        mockLinkBlockMapper = createSpyObject(LinkBlockMapper);
        mockVideoBlockMapper = createSpyObject(VideoBlockMapper);
        mockAccordionMapper = createSpyObject(AccordionMapper);
        mockJournalEntryMapper = createSpyObject(VisitJournalMapper);

        loader = new RestLearnplaceLoader(
            mockLearnplaceAPI,
            mockLearnplaceRepository,
            mockUserRepository,
            mockTextBlockMapper,
            mockPictureBlockMapper,
            mockLinkBlockMapper,
            mockVideoBlockMapper,
            mockAccordionMapper,
            mockJournalEntryMapper
        );
    });

    describe("a learnplace to load", () => {

        describe("on new learnplace", () => {

            it("should create the learnplace and its relations", async() => {

                const learnplace: LearnPlace = createLearnPlace();
                spyOn(mockLearnplaceAPI, "getLearnPlace").and.returnValue(Promise.resolve(learnplace));

                const blocks: BlockObject = createEmptyBlocks(); // we don't care about the blocks in this class
                spyOn(mockLearnplaceAPI, "getBlocks").and.returnValue(Promise.resolve(blocks));

                spyOn(mockLearnplaceAPI, "getJournalEntries") // we don't care about the visit journal in this class
                    .and.returnValue(Promise.resolve([]));

                spyOn(mockUserRepository, "findAuthenticatedUser")
                    .and.returnValue(Promise.resolve(Optional.of(testUser())));

                spyOn(mockLearnplaceRepository, "findByObjectIdAndUserId")
                    .and.returnValue(Promise.resolve(Optional.empty()));

                const saveStub: jasmine.Spy = spyOn(mockLearnplaceRepository, "save");
                saveStub.and.returnValue(Promise.resolve(new LearnplaceEntity())); // return value is not used, therefore an empty entity is enough

                // again, we don't care about the blocks or visit journal, therefore we return empty arrays
                const textBlockMapperStub: jasmine.Spy = mockTextBlockMapper.map;
                textBlockMapperStub.and.returnValue(Promise.resolve([]));

                const pictureBlockMapperStub: jasmine.Spy = mockPictureBlockMapper.map;
                pictureBlockMapperStub.and.returnValue(Promise.resolve([]));

                const linkBlockMapperStub: jasmine.Spy = mockLinkBlockMapper.map;
                linkBlockMapperStub.and.returnValue(Promise.resolve([]));

                const videoBlockMapperStub: jasmine.Spy = mockVideoBlockMapper.map;
                videoBlockMapperStub.and.returnValue(Promise.resolve([]));

                const visitJournalMapperStub: jasmine.Spy = mockJournalEntryMapper.map;
                visitJournalMapperStub.and.returnValue(Promise.resolve([]));

                const accordionMapperStub: jasmine.Spy = mockAccordionMapper.map;
                accordionMapperStub.and.returnValue(Promise.resolve([]));


                await loader.load(1);


                expect(saveStub).toHaveBeenCalledTimes(1);

                expect(textBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(pictureBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(linkBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(videoBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(visitJournalMapperStub).toHaveBeenCalledTimes(1);
                expect(accordionMapperStub).toHaveBeenCalledTimes(1);
            });
        });

        describe("on existing learnplace", () => {

            it("should update the existing learnplace and its relations", async() => {

                const learnplace: LearnPlace = createLearnPlace();
                spyOn(mockLearnplaceAPI, "getLearnPlace")
                    .and.returnValue(Promise.resolve(learnplace));

                const blocks: BlockObject = createEmptyBlocks(); // we don't care about the blocks in this class
                spyOn(mockLearnplaceAPI, "getBlocks")
                    .and.returnValue(Promise.resolve(blocks));

                spyOn(mockLearnplaceAPI, "getJournalEntries") // we don't care about the visit journal in this class
                    .and.returnValue(Promise.resolve([]));

                spyOn(mockUserRepository, "findAuthenticatedUser")
                    .and.returnValue(Promise.resolve(Optional.of(testUser())));

                spyOn(mockLearnplaceRepository, "findByObjectIdAndUserId")
                    .and.returnValue(Promise.resolve(Optional.of(getExistingLearnplace())));

                const saveStub: jasmine.Spy = spyOn(mockLearnplaceRepository, "save");
                saveStub.and.returnValue(Promise.resolve(new LearnplaceEntity())); // return value is not used, therefore an empty entity is enough

                // again, we don't care about the blocks or visit journal, therefore we return empty arrays
                const textBlockMapperStub: jasmine.Spy = mockTextBlockMapper.map;
                textBlockMapperStub.and.returnValue(Promise.resolve([]));

                const pictureBlockMapperStub: jasmine.Spy = mockPictureBlockMapper.map;
                pictureBlockMapperStub.and.returnValue(Promise.resolve([]));

                const linkBlockMapperStub: jasmine.Spy = mockLinkBlockMapper.map;
                linkBlockMapperStub.and.returnValue(Promise.resolve([]));

                const videoBlockMapperStub: jasmine.Spy = mockVideoBlockMapper.map;
                videoBlockMapperStub.and.returnValue(Promise.resolve([]));

                const visitJournalMapperStub: jasmine.Spy = mockJournalEntryMapper.map;
                visitJournalMapperStub.and.returnValue(Promise.resolve([]));

                const accordionMapperStub: jasmine.Spy = mockAccordionMapper.map;
                accordionMapperStub.and.returnValue(Promise.resolve([]));


                await loader.load(1);


                // we set now an id on the entities that exists already
                const expected: LearnplaceEntity = new LearnplaceEntity().applies<LearnplaceEntity>(function(): void {

                    this.id = "";
                    this.objectId = learnplace.objectId;
                    this.user = Promise.resolve(testUser());
                    this.map = new MapEntity().applies(function(): void {
                        this.id = 1;
                        this.visibility = getVisibilityEntity(learnplace.map.visibility);
                        this.zoom = 10;
                    });
                    this.location = new LocationEntity().applies(function(): void {
                        this.id = 1;
                        this.latitude = learnplace.location.latitude;
                        this.longitude = learnplace.location.longitude;
                        this.radius = learnplace.location.radius;
                        this.elevation = learnplace.location.elevation;
                    });

                    this.textBlocks = [];
                    this.pictureBlocks = [];
                    this.videoBlocks = [];
                    this.linkBlocks = [];
                    this.visitJournal = [];
                    this.accordionBlocks = [];
                });

                expect(textBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(pictureBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(linkBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(videoBlockMapperStub).toHaveBeenCalledTimes(1);
                expect(visitJournalMapperStub).toHaveBeenCalledTimes(1);
                expect(accordionMapperStub).toHaveBeenCalledTimes(1);

                // expect(saveStub).toHaveBeenCalledWith(expected); // TODO: check if there is a way to make deep equal with promises work
            })
        });

        describe("on http request error", () => {

            it("it should throw an learnplace loading error", async() => {

                spyOn(mockLearnplaceAPI, "getLearnPlace")
                    .and.callFake(() => Promise.reject(new HttpRequestError(500, "")));

                spyOn(mockLearnplaceAPI, "getBlocks")
                    .and.callFake(() => Promise.reject(new HttpRequestError(500, "")));

                spyOn(mockLearnplaceAPI, "getJournalEntries")
                    .and.callFake(() => Promise.reject(new HttpRequestError(500, "")));

                spyOn(mockUserRepository, "findAuthenticatedUser")
                    .and.returnValue(Promise.resolve(Optional.of(testUser())));

                spyOn(mockLearnplaceRepository, "findByObjectIdAndUserId")
                    .and.returnValue(Promise.resolve(Optional.empty()));

                spyOn(mockLearnplaceRepository, "exists")
                    .and.returnValue(Promise.resolve(false));


                await expectAsync(loader.load(1))
                    .toBeRejectedWithError(LearnplaceLoadingError, 'Could not load learnplace with id "1" over http connection');
            })
        });

        describe("on http request error with existing learnplace", () => {

            it("should not save any learnplace data", async() => {

                spyOn(mockLearnplaceAPI, "getLearnPlace")
                    .and.callFake(() => Promise.reject(new HttpRequestError(500, "")));

                spyOn(mockLearnplaceAPI, "getBlocks")
                    .and.callFake(() => Promise.reject(new HttpRequestError(500, "")));

                spyOn(mockLearnplaceAPI, "getJournalEntries")
                    .and.callFake(() => Promise.reject(new HttpRequestError(500, "")));

                spyOn(mockUserRepository, "findAuthenticatedUser")
                    .and.returnValue(Promise.resolve(Optional.of(testUser())));

                spyOn(mockLearnplaceRepository, "findByObjectIdAndUserId")
                    .and.returnValue(Promise.resolve(Optional.of(getExistingLearnplace())));

                spyOn(mockLearnplaceRepository, "exists")
                    .and.returnValue(Promise.resolve(true));

                const saveStub: jasmine.Spy = spyOn(mockLearnplaceRepository, "save");


                await loader.load(1);


                expect(saveStub).not.toHaveBeenCalled();
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
            visibility: "ALWAYS",
            zoomLevel: 10
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

function testUser(): UserEntity {
    return new UserEntity().applies(function(): void {
        this.id = 1;
    })
}

function getExistingLearnplace(): LearnplaceEntity {

    return new LearnplaceEntity().applies(function(): void {

        this.id = "";
        this.objectId = 24;

        this.user = Promise.resolve(testUser());

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
