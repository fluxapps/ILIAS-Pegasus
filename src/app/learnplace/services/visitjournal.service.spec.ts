import {createSpyObject} from "../../../test.util.spec";
import {Geolocation} from "../../services/device/geolocation/geolocation.service";
import {
  SynchronizedVisitJournalWatch,
  VisitJournalSynchronizationImpl
} from "./visitjournal.service";
import {LearnplaceAPI} from "../providers/rest/learnplace.api";
import {VisitJournalRepository} from "../providers/repository/visitjournal.repository";
import {VisitJournalEntity} from "../entity/visit-journal.entity";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {UserRepository} from "../../providers/repository/repository.user";
import {IllegalStateError} from "../../error/errors";

describe("a visit journal synchronization", () => {

  const mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
    getJournalEntries: (): undefined => undefined,
    getBlocks: (): undefined => undefined,
    addJournalEntry: (): undefined => undefined,
    getLearnPlace: (): undefined => undefined
  };
  const mockVisitJournalRepository: VisitJournalRepository = <VisitJournalRepository>{
    save: (): undefined => undefined,
    delete: (): undefined => undefined,
    exists: (): undefined => undefined,
    find: (): undefined => undefined,
    findUnsynchronized: (): undefined => undefined
  };

  let sync: VisitJournalSynchronizationImpl = new VisitJournalSynchronizationImpl(mockLearnplaceAPI, mockVisitJournalRepository);

	beforeEach(() => {
		sync = new VisitJournalSynchronizationImpl(mockLearnplaceAPI, mockVisitJournalRepository);
	});

	describe("a synchronization", () => {

		describe("on successful synchronization", () => {

			it("should save synchronized visit journals as synchronized", async() => {

				const unsynchronized: Array<VisitJournalEntity> = [
				  new VisitJournalEntity().applies(function(): void {
				    this.synchronized = false;
				    this.userId = 1;
				    this.time = 0;
				    this.learnplace = getLearnplace();
          })
        ];
				spyOn(mockVisitJournalRepository, "findUnsynchronized").and.returnValue(Promise.resolve(unsynchronized));

				const apiStub: jasmine.Spy = spyOn(mockLearnplaceAPI, "addJournalEntry").and.returnValue(Promise.resolve());
				const saveStub: jasmine.Spy = spyOn(mockVisitJournalRepository, "save")
          .and.returnValue(Promise.resolve(new VisitJournalEntity())); // return value does not matter here, so we just return an empty entity


        await sync.synchronize();


				const expected: VisitJournalEntity = new VisitJournalEntity().applies(function(): void {
				  this.synchronized = true;
				  this.userId = 1;
				  this.time = 0;
				  this.learnplace = getLearnplace();
        });
				expect(saveStub).toHaveBeenCalledWith(expected);
				expect(apiStub).toHaveBeenCalledWith(1, 0);
				expect(apiStub).toHaveBeenCalledTimes(1);
			});
		});

		describe("on failed migration", () => {

			it("should not save the failed entity", async() => {

        const unsynchronized: Array<VisitJournalEntity> = [
          new VisitJournalEntity().applies(function(): void {
            this.synchronized = false;
            this.userId = 1;
            this.time = 0;
            this.learnplace = getLearnplace();
          }),
          new VisitJournalEntity().applies(function(): void {
            this.synchronized = false;
            this.userId = 2;
            this.time = 0;
            this.learnplace = getLearnplace();
          })
        ];
        spyOn(mockVisitJournalRepository, "findUnsynchronized")
          .and.returnValue(Promise.resolve(unsynchronized));

        const apiStub: jasmine.Spy = spyOn(mockLearnplaceAPI, "addJournalEntry")
            .and.returnValues(Promise.resolve(), Promise.reject());

        const saveStub: jasmine.Spy = spyOn(mockVisitJournalRepository, "save")
          .and.returnValue(Promise.resolve(new VisitJournalEntity())); // return value does not matter here, so we just return an empty entity


        await sync.synchronize();


        const expected: VisitJournalEntity = new VisitJournalEntity().applies(function(): void {
          this.synchronized = true;
          this.userId = 1;
          this.time = 0;
          this.learnplace = getLearnplace();
        });
        expect(saveStub).toHaveBeenCalledWith(expected);
        expect(saveStub).toHaveBeenCalledTimes(1);
        expect(apiStub).toHaveBeenCalledWith(1, 0);
        expect(apiStub).toHaveBeenCalledTimes(2);
			})
		});
	});
});

function getLearnplace(): LearnplaceEntity {
  return new LearnplaceEntity().applies(function(): void {
    this.objectId = 1;
  });
}

describe("a visit journal watch", () => {

  const mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
      addJournalEntry: (): undefined => undefined,
      getLearnPlace: (): undefined => undefined,
      getBlocks: (): undefined => undefined,
      getJournalEntries: (): undefined => undefined
  };
  const mockLearnplaceRepository: LearnplaceRepository = <LearnplaceRepository>{
      find: (): undefined => undefined,
      delete: (): undefined => undefined,
      exists: (): undefined => undefined,
      save: (): undefined => undefined,
      findByObjectIdAndUserId: (): undefined => undefined
  };
  const mockUserRepository: UserRepository = <UserRepository>{
      save: (): undefined => undefined,
      exists: (): undefined => undefined,
      delete: (): undefined => undefined,
      find: (): undefined => undefined,
      findAuthenticatedUser: (): undefined => undefined
  };
  const mockGeolocation: jasmine.SpyObj<Geolocation> = createSpyObject(Geolocation);

  let watch: SynchronizedVisitJournalWatch = new SynchronizedVisitJournalWatch(
    mockLearnplaceAPI, mockLearnplaceRepository, mockUserRepository, mockGeolocation
  );

	beforeEach(() => {
		watch = new SynchronizedVisitJournalWatch(mockLearnplaceAPI, mockLearnplaceRepository, mockUserRepository, mockGeolocation);
	});

	describe("starting the watch", () => {

		describe("on no set learnplace id", () => {

			it("should throw an illegal state error", () => {

				expect(() => watch.start()).toThrowError(IllegalStateError, "Can not start SynchronizedVisitJournalWatch without learnplace id");
			});
		});
	});
});
