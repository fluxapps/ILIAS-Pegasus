import {
  SynchronizedVisitJournalWatch,
  VisitJournalSynchronizationImpl
} from "../../../src/learnplace/services/visitjournal.service";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {LearnplaceAPI} from "../../../src/learnplace/providers/rest/learnplace.api";
import {VisitJournalRepository} from "../../../src/learnplace/providers/repository/visitjournal.repository";
import {VisitJournalEntity} from "../../../src/learnplace/entity/visit-journal.entity";
import {LearnplaceEntity} from "../../../src/learnplace/entity/learnplace.entity";
import {LearnplaceRepository} from "../../../src/learnplace/providers/repository/learnplace.repository";
import {UserRepository} from "../../../src/providers/repository/repository.user";
import {Geolocation} from "@ionic-native/geolocation";
import {stubInstance} from "../../SinonUtils";
import {IllegalStateError} from "../../../src/error/errors";

describe("a visit journal synchronization", () => {

  const sandbox: SinonSandbox = createSandbox();
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

	afterEach(() => {
		sandbox.restore();
	});

	describe("a synchronization", () => {

		context("on successful synchronization", () => {

			it("should save synchronized visit journals as synchronized", async() => {

				const unsynchronized: Array<VisitJournalEntity> = [
				  new VisitJournalEntity().applies(function(): void {
				    this.synchronized = false;
				    this.userId = 1;
				    this.time = 0;
				    this.learnplace = getLearnplace();
          })
        ];
				sandbox.stub(mockVisitJournalRepository, "findUnsynchronized")
          .resolves(unsynchronized);

				const apiStub: SinonStub = sandbox.stub(mockLearnplaceAPI, "addJournalEntry")
          .resolves();
				const saveStub: SinonStub = sandbox.stub(mockVisitJournalRepository, "save")
          .resolves(new VisitJournalEntity()); // return value does not matter here, so we just return an empty entity


        await sync.synchronize();


				const expected: VisitJournalEntity = new VisitJournalEntity().applies(function(): void {
				  this.synchronized = true;
				  this.userId = 1;
				  this.time = 0;
				  this.learnplace = getLearnplace();
        });
				assert.calledOnce(saveStub.withArgs(expected));
				assert.calledOnce(apiStub.withArgs(1, 0));
			});
		});

		context("on failed migration", () => {

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
        sandbox.stub(mockVisitJournalRepository, "findUnsynchronized")
          .resolves(unsynchronized);

        const apiStub: SinonStub = sandbox.stub(mockLearnplaceAPI, "addJournalEntry")
          .onFirstCall()
          .resolves()
          .onSecondCall()
          .rejects();

        const saveStub: SinonStub = sandbox.stub(mockVisitJournalRepository, "save")
          .resolves(new VisitJournalEntity()); // return value does not matter here, so we just return an empty entity


        await sync.synchronize();


        const expected: VisitJournalEntity = new VisitJournalEntity().applies(function(): void {
          this.synchronized = true;
          this.userId = 1;
          this.time = 0;
          this.learnplace = getLearnplace();
        });
        assert.calledOnce(saveStub.withArgs(expected));
        assert.calledTwice(apiStub.withArgs(1, 0));
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

  const sandbox: SinonSandbox = createSandbox();

  const mockLearnplaceAPI: LearnplaceAPI = <LearnplaceAPI>{
    addJournalEntry: () => undefined, getLearnPlace: () => undefined, getBlocks: () => undefined, getJournalEntries: () => undefined
  };
  const mockLearnplaceRepository: LearnplaceRepository = <LearnplaceRepository>{
    find: () => undefined, delete: () => undefined, exists: () => undefined, save: () => undefined, findByObjectIdAndUserId: () => undefined
  };
  const mockUserRepository: UserRepository = <UserRepository>{
    save: () => undefined, exists: () => undefined, delete: () => undefined, find: () => undefined, findAuthenticatedUser: () => undefined
  };
  const mockGeolocation: Geolocation = stubInstance(Geolocation);

  let watch: SynchronizedVisitJournalWatch = new SynchronizedVisitJournalWatch(
    mockLearnplaceAPI, mockLearnplaceRepository, mockUserRepository, mockGeolocation
  );

	beforeEach(() => {
		watch = new SynchronizedVisitJournalWatch(mockLearnplaceAPI, mockLearnplaceRepository, mockUserRepository, mockGeolocation);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("starting the watch", () => {

		context("on no set learnplace id", () => {

			it("should throw an illegal state error", () => {

				chai.expect(() => watch.start())
          .to.throw(IllegalStateError)
          .and.have.property("message", "Can not start SynchronizedVisitJournalWatch without learnplace id");
			});
		});
	});
});
