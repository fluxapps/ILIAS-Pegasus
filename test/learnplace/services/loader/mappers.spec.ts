import {SinonSandbox, createSandbox, SinonStub} from "sinon";
import {
  LinkBlockMapper,
  PictureBlockMapper, SimpleStorageLocation,
  TextBlockMapper, VideoBlockMapper, VisitJournalMapper
} from "../../../../src/learnplace/services/loader/mappers";
import {
  ILIASLinkBlock, JournalEntry, PictureBlock, TextBlock,
  VideoBlock
} from "../../../../src/learnplace/providers/rest/learnplace.pojo";
import {TextblockEntity} from "../../../../src/learnplace/entity/textblock.entity";
import {getVisibilityEntity} from "./learnplace.spec";
import {stubInstance} from "../../../SinonUtils";
import {FileTransfer} from "@ionic-native/file-transfer";
import {LearnplaceData, LearnplaceObject} from "../../../../src/learnplace/services/loader/learnplace";
import {File} from "@ionic-native/file";
import {PictureBlockEntity} from "../../../../src/learnplace/entity/pictureBlock.entity";
import {LinkblockEntity} from "../../../../src/learnplace/entity/linkblock.entity";
import {VideoBlockEntity} from "../../../../src/learnplace/entity/videoblock.entity";
import {VisitJournalEntity} from "../../../../src/learnplace/entity/visit-journal.entity";

describe("a text block mapper", () => {

  let mapper: TextBlockMapper = new TextBlockMapper();

	beforeEach(() => {
		mapper = new TextBlockMapper();
	});

	describe("on mapping text blocks", () => {

		context("on new text blocks", () => {

			it("should create new text block entities", () => {

			  const local: Array<TextblockEntity> = [];

				const remote: Array<TextBlock> = [
          <TextBlock>{id: 1, sequence: 1, visibility: "ALWAYS",  content: "some text"},
          <TextBlock>{id: 2, sequence: 2, visibility: "NEVER", content: "new text"}
        ];


        const result: Array<TextblockEntity> = mapper.map(local, remote);


        const expected: Array<TextblockEntity> = [
          new TextblockEntity().applies( function(): void {
            this.sequence = 1;
            this.iliasId = 1;
            this.content = "some text";
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new TextblockEntity().applies(function(): void {
            this.sequence = 2;
            this.iliasId = 2;
            this.content = "new text";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing textblocks", () => {

			it("should update the existing ones", () => {

        const local: Array<TextblockEntity> = [
          new TextblockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.content = "some old text";
            this.visibility = getVisibilityEntity("ALWAYS");
          })
        ];

        const remote: Array<TextBlock> = [
          <TextBlock>{id: 1, sequence: 1, visibility: "NEVER",  content: "some text"},
          <TextBlock>{id: 2, sequence: 2, visibility: "NEVER", content: "new text"}
        ];


        const result: Array<TextblockEntity> = mapper.map(local, remote);


        const expected: Array<TextblockEntity> = [
          new TextblockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.content = "some text";
            this.visibility = getVisibilityEntity("NEVER");
          }),
          new TextblockEntity().applies(function(): void {
            this.sequence = 2;
            this.iliasId = 2;
            this.content = "new text";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});


describe("a picture block mapper", () => {

  const sandbox: SinonSandbox = createSandbox();
  const mockFileTransfer: FileTransfer = stubInstance(FileTransfer);
  const learnplace: LearnplaceData = new LearnplaceObject().applies(function(): void {
    this.setId(1);
    this.setName("Learnplace xy");
  });
  const mockFile: File = stubInstance(File);
  const mockStorageLocation: SimpleStorageLocation = stubInstance(SimpleStorageLocation);

  let mapper: PictureBlockMapper = new PictureBlockMapper();

	beforeEach(() => {
		mapper = new PictureBlockMapper();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("on mapping picture blocks", () => {

		context("on new picture blocks", () => {

			it("should create new picture block entities", () => {

			  const local: Array<PictureBlockEntity> = [];

			  const remote: Array<PictureBlock> = [
          <PictureBlock>{id: 1, sequence: 3, visibility: "ALWAYS", title: "title", description: "", thumbnail: "=1e", url: "get/picture/1"},
          <PictureBlock>{id: 2, sequence: 4, visibility: "NEVER", title: "title 2", description: "", thumbnail: "=2e", url: "get/picture/2"}
        ];


			  const result: Array<PictureBlockEntity> = mapper.map(local, remote);


			  const expected: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.sequence = 3;
            this.iliasId = 1;
            this.title = "title";
            this.description = "";
            this.thumbnail = "=1e";
            this.url = "get/picture/1";
            this.visibility = getVisibilityEntity("ALWAYS")
          }),
          new PictureBlockEntity().applies(function(): void {
            this.sequence = 4;
            this.iliasId = 2;
            this.title = "title 2";
            this.description = "";
            this.thumbnail = "=2e";
            this.url = "get/picture/2";
            this.visibility = getVisibilityEntity("NEVER")
          })
        ];
			  chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing picture blocks", () => {

			it("should update the existing ones", () => {

        const local: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 3;
            this.title = "title old";
            this.description = "";
            this.thumbnail = "=1e";
            this.url = "get/picture/1";
            this.visibility = getVisibilityEntity("ALWAYS")
          })
        ];

        const remote: Array<PictureBlock> = [
          <PictureBlock>{id: 1, sequence: 3, visibility: "ALWAYS", title: "title", description: "", thumbnail: "=1e", url: "get/picture/1"},
          <PictureBlock>{id: 2, sequence: 4, visibility: "NEVER", title: "title 2", description: "", thumbnail: "=2e", url: "get/picture/2"}
        ];

        sandbox.stub(mockStorageLocation, "getUserStorageLocation")
          .resolves("/somewhere/on/the/filesystem/");


        const result: Array<PictureBlockEntity> = mapper.map(local, remote);


        const expected: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 3;
            this.title = "title";
            this.description = "";
            this.thumbnail = "=1e";
            this.url = "get/picture/1";
            this.visibility = getVisibilityEntity("ALWAYS")
          }),
          new PictureBlockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 4;
            this.title = "title 2";
            this.description = "";
            this.thumbnail = "=2e";
            this.url = "get/picture/2";
            this.visibility = getVisibilityEntity("NEVER")
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});

describe("a link block mapper", () => {

  let mapper: LinkBlockMapper = new LinkBlockMapper();

	beforeEach(() => {
		mapper = new LinkBlockMapper();
	});

	describe("mapping link blocks", () => {

		context("on new link blocks", () => {

			it("should create link block entities", () => {

				const local: Array<LinkblockEntity> = [];

				const remote: Array<ILIASLinkBlock> = [
				  <ILIASLinkBlock>{id: 1, sequence: 1, refId: 255, visibility: "ALWAYS"},
          <ILIASLinkBlock>{id: 2, sequence: 2, refId: 87, visibility: "NEVER"}
        ];


        const result: Array<LinkblockEntity> = mapper.map(local, remote);


        const expected: Array<LinkblockEntity> = [
          new LinkblockEntity().applies(function(): void {
            this.iliasId = 1;
            this.sequence = 1;
            this.refId = 255;
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new LinkblockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.refId = 87;
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing link blocks", () => {

			it("should update the existing ones", () => {

        const local: Array<LinkblockEntity> = [
          new LinkblockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.refId = 5;
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];

        const remote: Array<ILIASLinkBlock> = [
          <ILIASLinkBlock>{id: 1, sequence: 1, refId: 255, visibility: "ALWAYS"},
          <ILIASLinkBlock>{id: 2, sequence: 2, refId: 87, visibility: "NEVER"}
        ];


        const result: Array<LinkblockEntity> = mapper.map(local, remote);


        const expected: Array<LinkblockEntity> = [
          new LinkblockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.refId = 255;
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new LinkblockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.refId = 87;
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});

describe("a video block mapper", () => {

    const sandbox: SinonSandbox = createSandbox();

    let mapper: VideoBlockMapper = new VideoBlockMapper();

	beforeEach(() => {
		mapper = new VideoBlockMapper();
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("on mapping video blocks", () => {

		context("on new video blocks", () => {

			it("should create new video block entities", () => {

				const local: Array<VideoBlockEntity> = [];

				const remote: Array<VideoBlock> = [
				  <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"},
          <VideoBlock>{id: 2, sequence: 2, url: "/get/video/2", hash: "4B8A", visibility: "NEVER"}
        ];


				const result: Array<VideoBlockEntity> = mapper.map(local, remote);


				const expected: Array<VideoBlockEntity> = [
				  new VideoBlockEntity().applies(function(): void {
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "/get/video/1";
            this.hash = "FB24";
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new VideoBlockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.url = "/get/video/2";
            this.hash = "4B8A";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
				chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing video blocks", () => {

			it("should update the existing ones", () => {

        const local: Array<VideoBlockEntity> = [
          new VideoBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "/get/video/1";
            this.hash = "A68B";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];

        const remote: Array<VideoBlock> = [
          <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"},
          <VideoBlock>{id: 2, sequence: 2, url: "/get/video/2", hash: "4B8A", visibility: "NEVER"}
        ];


        const result: Array<VideoBlockEntity> = mapper.map(local, remote);


        const expected: Array<VideoBlockEntity> = [
          new VideoBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "/get/video/1";
            this.hash = "FB24";
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new VideoBlockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.url = "/get/video/2";
            this.hash = "4B8A";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});

describe("a visit journal mapper", () => {

  let mapper: VisitJournalMapper = new VisitJournalMapper();

	beforeEach(() => {
		mapper = new VisitJournalMapper();
	});

	describe("on mapping journal entries", () => {

		context("on new journal entries", () => {

			it("should create new journal entities", () => {

				const local: Array<VisitJournalEntity> = [];

				const remote: Array<JournalEntry> = [
				  <JournalEntry>{
				    username: "mmuster",
            timestamp: 0
          },
          <JournalEntry>{
				    username: "ssuster",
            timestamp: 0
          }
        ];


				const result: Array<VisitJournalEntity> = mapper.map(local, remote);


				const expected: Array<VisitJournalEntity> = [
				  new VisitJournalEntity().applies(function(): void {
				    this.username = "mmuster";
				    this.time = 0;
				    this.synchronized = true;
          }),
          new VisitJournalEntity().applies(function(): void {
            this.username = "ssuster";
            this.time = 0;
            this.synchronized = true;
          })
        ];

				chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing journal entries", () => {

			it("should update the existing journal entities", () => {

        const local: Array<VisitJournalEntity> = [
          new VisitJournalEntity().applies(function(): void {
            this.id = 1;
            this.username = "mmuster";
            this.time = 0;
            this.synchronized = true;
          }),
          new VisitJournalEntity().applies(function(): void {
            this.username = "ssuster";
            this.time = 0;
            this.synchronized = true;
          })
        ];

        const remote: Array<JournalEntry> = [
          <JournalEntry>{
            username: "mmuster",
            timestamp: 0
          },
          <JournalEntry>{
            username: "ssuster",
            timestamp: 0
          }
        ];


        const result: Array<VisitJournalEntity> = mapper.map(local, remote);


        const expected: Array<VisitJournalEntity> = [
          new VisitJournalEntity().applies(function(): void {
            this.id = 1;
            this.username = "mmuster";
            this.time = 0;
            this.synchronized = true;
          }),
          new VisitJournalEntity().applies(function(): void {
            this.username = "ssuster";
            this.time = 0;
            this.synchronized = true;
          })
        ];

        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});
