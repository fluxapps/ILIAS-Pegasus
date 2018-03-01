import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {
  AccordionMapper,
  LinkBlockMapper,
  PictureBlockMapper,
  TextBlockMapper, VideoBlockMapper, VisitJournalMapper
} from "../../../../src/learnplace/services/loader/mappers";
import {
  AccordionBlock,
  ILIASLinkBlock, JournalEntry, PictureBlock, TextBlock,
  VideoBlock
} from "../../../../src/learnplace/providers/rest/learnplace.pojo";
import {TextblockEntity} from "../../../../src/learnplace/entity/textblock.entity";
import {getVisibilityEntity} from "./learnplace.spec";
import {PictureBlockEntity} from "../../../../src/learnplace/entity/pictureBlock.entity";
import {LinkblockEntity} from "../../../../src/learnplace/entity/linkblock.entity";
import {VideoBlockEntity} from "../../../../src/learnplace/entity/videoblock.entity";
import {VisitJournalEntity} from "../../../../src/learnplace/entity/visit-journal.entity";
import {ResourceTransfer} from "../../../../src/learnplace/services/loader/resource";
import {File} from "@ionic-native/file";
import {stubInstance} from "../../../SinonUtils";
import {Platform} from "ionic-angular";
import {platform} from "os";
import {AccordionEntity} from "../../../../src/learnplace/entity/accordion.entity";

describe("a text block mapper", () => {

  let mapper: TextBlockMapper = new TextBlockMapper();

	beforeEach(() => {
		mapper = new TextBlockMapper();
	});

	describe("on mapping text blocks", () => {

		context("on new text blocks", () => {

			it("should create new text block entities", async() => {

			  const local: Array<TextblockEntity> = [];

				const remote: Array<TextBlock> = [
          <TextBlock>{id: 1, sequence: 1, visibility: "ALWAYS",  content: "some text"},
          <TextBlock>{id: 2, sequence: 2, visibility: "NEVER", content: "new text"}
        ];


        const result: Array<TextblockEntity> = await mapper.map(local, remote);


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

			it("should update the existing ones", async() => {

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


        const result: Array<TextblockEntity> = await mapper.map(local, remote);


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

  const mockResourceTransfer: ResourceTransfer = <ResourceTransfer>{
    transfer: () => undefined
  };
  const mockFile: File = stubInstance(File);
  const mockPlatform: Platform = stubInstance(Platform);

  let mapper: PictureBlockMapper = new PictureBlockMapper(mockResourceTransfer, mockFile, mockPlatform);

	beforeEach(() => {
		mapper = new PictureBlockMapper(mockResourceTransfer, mockFile, mockPlatform);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("on mapping picture blocks", () => {

		context("on new picture blocks", () => {

			it("should create new picture block entities and transfer its pictures", async() => {

			  const local: Array<PictureBlockEntity> = [];

			  const remote: Array<PictureBlock> = [
          <PictureBlock>{id: 1, sequence: 3, visibility: "ALWAYS", title: "title", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1e", url: "get/picture/1", hash: "=2e"},
          <PictureBlock>{id: 2, sequence: 4, visibility: "NEVER", title: "title 2", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1ea", url: "get/picture/2", hash: "=2ea"}
        ];

			  sandbox.stub(mockResourceTransfer, "transfer")
          .resolves("absolute/local/path/image.png");


			  const result: Array<PictureBlockEntity> = await mapper.map(local, remote);


			  const expected: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.sequence = 3;
            this.iliasId = 1;
            this.title = "title";
            this.description = "";
            this.thumbnailHash = "=1e";
            this.thumbnail = "absolute/local/path/image.png";
            this.url = "absolute/local/path/image.png";
            this.hash = "=2e";
            this.visibility = getVisibilityEntity("ALWAYS")
          }),
          new PictureBlockEntity().applies(function(): void {
            this.sequence = 4;
            this.iliasId = 2;
            this.title = "title 2";
            this.description = "";
            this.thumbnailHash = "=1ea";
            this.thumbnail = "absolute/local/path/image.png";
            this.url = "absolute/local/path/image.png";
            this.hash = "=2ea";
            this.visibility = getVisibilityEntity("NEVER")
          })
        ];
			  chai.expect(result)
          .to.be.deep.equal(expected, `Expected: ${JSON.stringify(expected)}, but was: ${JSON.stringify(result)}`);
			});
		});

		context("on existing picture blocks", () => {

			it("should update the existing ones", async() => {

        const local: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 3;
            this.title = "title old";
            this.description = "";
            this.thumbnailHash = "=1e";
            this.thumbnail = "/local/path/image.png";
            this.url = "/local/path/image.png";
            this.hash = "=2e";
            this.visibility = getVisibilityEntity("ALWAYS")
          })
        ];

        const remote: Array<PictureBlock> = [
          <PictureBlock>{id: 1, sequence: 3, visibility: "ALWAYS", title: "title", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1e", url: "get/picture/1", hash: "=2e"},
          <PictureBlock>{id: 2, sequence: 4, visibility: "NEVER", title: "title 2", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1ea", url: "get/picture/2", hash: "=2ea"}
        ];

        sandbox.stub(mockResourceTransfer, "transfer")
          .resolves("absolute/local/path/image.png");


        const result: Array<PictureBlockEntity> = await mapper.map(local, remote);


        const expected: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 3;
            this.title = "title";
            this.description = "";
            this.thumbnailHash = "=1e";
            this.thumbnail = "/local/path/image.png";
            this.url = "/local/path/image.png";
            this.hash = "=2e";
            this.visibility = getVisibilityEntity("ALWAYS")
          }),
          new PictureBlockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 4;
            this.title = "title 2";
            this.description = "";
            this.thumbnailHash = "=1ea";
            this.thumbnail = "absolute/local/path/image.png";
            this.url = "absolute/local/path/image.png";
            this.hash = "=2ea";
            this.visibility = getVisibilityEntity("NEVER")
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});

		context("on updated pictures", () => {

			it("should delete the old picture", async() => {

        const local: Array<PictureBlockEntity> = [
          new PictureBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 3;
            this.title = "title";
            this.description = "";
            this.thumbnailHash = "=1e";
            this.thumbnail = "/local/path/image.png";
            this.url = "/local/path/image.png";
            this.hash = "=2e";
            this.visibility = getVisibilityEntity("ALWAYS")
          })
        ];

        const remote: Array<PictureBlock> = [
          <PictureBlock>{id: 1, sequence: 3, visibility: "ALWAYS", title: "title", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1d", url: "get/picture/1", hash: "=2d"}
        ];

        sandbox.stub(mockResourceTransfer, "transfer")
          .resolves("absolute/local/path/image.png");

        sandbox.stub(mockPlatform, "is")
          .withArgs("ios") // just to use mock the File correct
          .returns(true);
        sandbox.stub(mockFile, "dataDirectory") // ios uses this property
          .get(() => "test/");
        const deleteStub: SinonStub = sandbox.stub(mockFile, "removeFile")
          .resolves();


        await mapper.map(local, remote);


        assert.calledTwice(deleteStub);
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

			it("should create link block entities", async() => {

				const local: Array<LinkblockEntity> = [];

				const remote: Array<ILIASLinkBlock> = [
				  <ILIASLinkBlock>{id: 1, sequence: 1, refId: 255, visibility: "ALWAYS"},
          <ILIASLinkBlock>{id: 2, sequence: 2, refId: 87, visibility: "NEVER"}
        ];


        const result: Array<LinkblockEntity> = await mapper.map(local, remote);


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

			it("should update the existing ones", async() => {

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


        const result: Array<LinkblockEntity> = await mapper.map(local, remote);


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

  const mockResourceTransfer: ResourceTransfer = <ResourceTransfer>{
    transfer: () => undefined
  };
  const mockFile: File = stubInstance(File);
  const mockPlatform: Platform = stubInstance(Platform);

  let mapper: VideoBlockMapper = new VideoBlockMapper(mockResourceTransfer, mockFile, mockPlatform);

	beforeEach(() => {
		mapper = new VideoBlockMapper(mockResourceTransfer, mockFile, mockPlatform);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("on mapping video blocks", () => {

		context("on new video blocks", () => {

			it("should create new video block entities", async() => {

				const local: Array<VideoBlockEntity> = [];

				const remote: Array<VideoBlock> = [
				  <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"},
          <VideoBlock>{id: 2, sequence: 2, url: "/get/video/2", hash: "4B8A", visibility: "NEVER"}
        ];

				sandbox.stub(mockResourceTransfer, "transfer")
          .resolves("absolute/path/image.png");


				const result: Array<VideoBlockEntity> = await mapper.map(local, remote);


				const expected: Array<VideoBlockEntity> = [
				  new VideoBlockEntity().applies(function(): void {
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "absolute/path/image.png";
            this.hash = "FB24";
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new VideoBlockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.url = "absolute/path/image.png";
            this.hash = "4B8A";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
				chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing video blocks", () => {

			it("should update the existing ones", async() => {

        const local: Array<VideoBlockEntity> = [
          new VideoBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "path/image.png";
            this.hash = "FB24";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];

        const remote: Array<VideoBlock> = [
          <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"},
          <VideoBlock>{id: 2, sequence: 2, url: "/get/video/2", hash: "4B8A", visibility: "NEVER"}
        ];

        sandbox.stub(mockResourceTransfer, "transfer")
          .resolves("absolute/path/image.png");


        const result: Array<VideoBlockEntity> = await mapper.map(local, remote);


        const expected: Array<VideoBlockEntity> = [
          new VideoBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "path/image.png";
            this.hash = "FB24";
            this.visibility = getVisibilityEntity("ALWAYS");
          }),
          new VideoBlockEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.url = "absolute/path/image.png";
            this.hash = "4B8A";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});

		context("on updated video", () => {

			it("should delete the old video file", async() => {

        const local: Array<VideoBlockEntity> = [
          new VideoBlockEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.url = "path/image.png";
            this.hash = "FB23";
            this.visibility = getVisibilityEntity("NEVER");
          })
        ];

        const remote: Array<VideoBlock> = [
          <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"}
        ];

        sandbox.stub(mockResourceTransfer, "transfer")
          .resolves("absolute/path/image.png");

        sandbox.stub(mockPlatform, "is")
          .withArgs("ios") // just to use mock the File correct
          .returns(true);
        sandbox.stub(mockFile, "dataDirectory") // ios uses this property
          .get(() => "test/");
        const deleteStub: SinonStub = sandbox.stub(mockFile, "removeFile")
          .resolves();


        await mapper.map(local, remote);


        assert.calledOnce(deleteStub);
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

			it("should create new journal entities", async() => {

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


				const result: Array<VisitJournalEntity> = await mapper.map(local, remote);


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

			it("should update the existing journal entities", async() => {

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


        const result: Array<VisitJournalEntity> =await mapper.map(local, remote);


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

describe("a accordion mapper", () => {

    const sandbox: SinonSandbox = createSandbox();

    const mockTextMapper: TextBlockMapper = stubInstance(TextBlockMapper);
    const mockPictureMapper: PictureBlockMapper = stubInstance(PictureBlockMapper);
    const mockLinkMapper: LinkBlockMapper = stubInstance(LinkBlockMapper);
    const mockVideoMapper: VideoBlockMapper = stubInstance(VideoBlockMapper);

    let mapper: AccordionMapper = new AccordionMapper(mockTextMapper, mockPictureMapper, mockLinkMapper, mockVideoMapper);

	beforeEach(() => {
		mapper = new AccordionMapper(mockTextMapper, mockPictureMapper, mockLinkMapper, mockVideoMapper);
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("mapping accordion blocks", () => {

		context("on new accordion blocks", () => {

			it("should create new accordion entities", async() => {

				const local: Array<AccordionEntity> = [];

				const remote: Array<AccordionBlock> = [
				  <AccordionBlock>{id: 1, sequence: 1, visibility: "ALWAYS", text: [
				      <TextBlock>{id: 1, sequence: 1, content: "", visibility: "ALWAYS"}
            ]},
          <AccordionBlock>{id: 2, sequence: 2, visibility: "ALWAYS", text: [
              <TextBlock>{id: 2, sequence: 1, content: "", visibility: "ALWAYS"}
            ]}
        ];

				// We do not resolve the entities, we only want to check if the mapper is called
				const textMapperStub: SinonStub = sandbox.stub(mockTextMapper, "map")
          .resolves(undefined);
				const pictureMapperStub: SinonStub = sandbox.stub(mockPictureMapper, "map")
          .resolves(undefined);
				const linkMapperStub: SinonStub = sandbox.stub(mockLinkMapper, "map")
          .resolves(undefined);
				const videoMapperStub: SinonStub = sandbox.stub(mockVideoMapper, "map")
          .resolves(undefined);


				const result: Array<AccordionEntity> = await mapper.map(local, remote);


				// because we resolve undefined on the block mappers, we set undefined on any block of an accordion
				const expected: Array<AccordionEntity> = [
				  new AccordionEntity().applies(function(): void {
            this.iliasId = 1;
            this.sequence = 1;
            this.visibility = getVisibilityEntity("ALWAYS");
            this.textBlocks = undefined;
            this.pictureBlocks = undefined;
            this.linkBlocks = undefined;
            this.videoBlocks = undefined;
          }),
          new AccordionEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.visibility = getVisibilityEntity("ALWAYS");
            this.textBlocks = undefined;
            this.pictureBlocks = undefined;
            this.linkBlocks = undefined;
            this.videoBlocks = undefined;
          })
        ];
				chai.expect(result)
          .to.be.deep.equal(expected, `Expected: ${JSON.stringify(expected)}, but was: ${JSON.stringify(result)}`);

				assert.calledTwice(textMapperStub);
				assert.calledTwice(pictureMapperStub);
				assert.calledTwice(linkMapperStub);
				assert.calledTwice(videoMapperStub);
			});
		});

		context("on existing accordion blocks", () => {

			it("should update the existing accordion entities", async() => {

        const local: Array<AccordionEntity> = [
          new AccordionEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.visibility = getVisibilityEntity("NEVER");
            this.textBlocks = undefined;
            this.pictureBlocks = undefined;
            this.linkBlocks = undefined;
            this.videoBlocks = undefined;
          })
        ];

        const remote: Array<AccordionBlock> = [
          <AccordionBlock>{id: 1, sequence: 1, visibility: "ALWAYS", text: [
              <TextBlock>{id: 1, sequence: 1, content: "", visibility: "ALWAYS"}
            ]},
          <AccordionBlock>{id: 2, sequence: 2, visibility: "ALWAYS", text: [
              <TextBlock>{id: 2, sequence: 1, content: "", visibility: "ALWAYS"}
            ]}
        ];

        // We do not resolve the entities, we only want to check if the mapper is called
        const textMapperStub: SinonStub = sandbox.stub(mockTextMapper, "map")
          .resolves(undefined);
        const pictureMapperStub: SinonStub = sandbox.stub(mockPictureMapper, "map")
          .resolves(undefined);
        const linkMapperStub: SinonStub = sandbox.stub(mockLinkMapper, "map")
          .resolves(undefined);
        const videoMapperStub: SinonStub = sandbox.stub(mockVideoMapper, "map")
          .resolves(undefined);


        const result: Array<AccordionEntity> = await mapper.map(local, remote);


        // because we resolve undefined on the block mappers, we set undefined on any block of an accordion
        const expected: Array<AccordionEntity> = [
          new AccordionEntity().applies(function(): void {
            this.id = 1;
            this.iliasId = 1;
            this.sequence = 1;
            this.visibility = getVisibilityEntity("ALWAYS");
            this.textBlocks = undefined;
            this.pictureBlocks = undefined;
            this.linkBlocks = undefined;
            this.videoBlocks = undefined;
          }),
          new AccordionEntity().applies(function(): void {
            this.iliasId = 2;
            this.sequence = 2;
            this.visibility = getVisibilityEntity("ALWAYS");
            this.textBlocks = undefined;
            this.pictureBlocks = undefined;
            this.linkBlocks = undefined;
            this.videoBlocks = undefined;
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected, `Expected: ${JSON.stringify(expected)}, but was: ${JSON.stringify(result)}`);

        assert.calledTwice(textMapperStub);
        assert.calledTwice(pictureMapperStub);
        assert.calledTwice(linkMapperStub);
        assert.calledTwice(videoMapperStub);
			})
		});
	});
});
