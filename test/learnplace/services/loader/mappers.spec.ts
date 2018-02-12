import {SinonSandbox, createSandbox, SinonStub} from "sinon";
import {
  PictureBlockMapper, SimpleStorageLocation,
  TextBlockMapper, VideoBlockMapper
} from "../../../../src/learnplace/services/loader/mappers";
import {PictureBlock, TextBlock, VideoBlock} from "../../../../src/learnplace/providers/rest/learnplace.pojo";
import {TextblockEntity} from "../../../../src/learnplace/entity/textblock.entity";
import {apply} from "../../../../src/util/util.function";
import {getVisibilityEntity} from "./learnplace.spec";
import {stubInstance} from "../../../SinonUtils";
import {FileTransfer} from "@ionic-native/file-transfer";
import {LearnplaceData, LearnplaceObject} from "../../../../src/learnplace/services/loader/learnplace";
import {File} from "@ionic-native/file";
import {PictureBlockEntity} from "../../../../src/learnplace/entity/pictureBlock.entity";
import {VideoBlockEntity} from "../../../../src/learnplace/entity/videoblock.entity";

describe("a text block mapper", () => {

  const sandbox: SinonSandbox = createSandbox();

  let mapper: TextBlockMapper = new TextBlockMapper();

	beforeEach(() => {
		mapper = new TextBlockMapper();
	});

	afterEach(() => {
		sandbox.restore();
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
          apply(new TextblockEntity(), it => {
            it.sequence = 1;
            it.iliasId = 1;
            it.content = "some text";
            it.visibility = getVisibilityEntity("ALWAYS");
          }),
          apply(new TextblockEntity(), it => {
            it.sequence = 2;
            it.iliasId = 2;
            it.content = "new text";
            it.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing textblocks", () => {

			it("should update the existing ones", () => {

        const local: Array<TextblockEntity> = [
          apply(new TextblockEntity(), it => {
            it.id = 1;
            it.iliasId = 1;
            it.sequence = 1;
            it.content = "some old text";
            it.visibility = getVisibilityEntity("ALWAYS");
          })
        ];

        const remote: Array<TextBlock> = [
          <TextBlock>{id: 1, sequence: 1, visibility: "NEVER",  content: "some text"},
          <TextBlock>{id: 2, sequence: 2, visibility: "NEVER", content: "new text"}
        ];


        const result: Array<TextblockEntity> = mapper.map(local, remote);


        const expected: Array<TextblockEntity> = [
          apply(new TextblockEntity(), it => {
            it.id = 1;
            it.iliasId = 1;
            it.sequence = 1;
            it.content = "some text";
            it.visibility = getVisibilityEntity("NEVER");
          }),
          apply(new TextblockEntity(), it => {
            it.sequence = 2;
            it.iliasId = 2;
            it.content = "new text";
            it.visibility = getVisibilityEntity("NEVER");
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
  const learnplace: LearnplaceData = apply(new LearnplaceObject(), it => {
    it.setId(1);
    it.setName("Learnplace xy");
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
          apply(new PictureBlockEntity(), it => {
            it.sequence = 3;
            it.iliasId = 1;
            it.title = "title";
            it.description = "";
            it.thumbnail = "=1e";
            it.url = "get/picture/1";
            it.visibility = getVisibilityEntity("ALWAYS")
          }),
          apply(new PictureBlockEntity(), it => {
            it.sequence = 4;
            it.iliasId = 2;
            it.title = "title 2";
            it.description = "";
            it.thumbnail = "=2e";
            it.url = "get/picture/2";
            it.visibility = getVisibilityEntity("NEVER")
          })
        ];
			  chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing picture blocks", () => {

			it("should update the existing ones", () => {

        const local: Array<PictureBlockEntity> = [
          apply(new PictureBlockEntity(), it => {
            it.id = 1;
            it.iliasId = 1;
            it.sequence = 3;
            it.title = "title old";
            it.description = "";
            it.thumbnail = "=1e";
            it.url = "get/picture/1";
            it.visibility = getVisibilityEntity("ALWAYS")
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
          apply(new PictureBlockEntity(), it => {
            it.id = 1;
            it.iliasId = 1;
            it.sequence = 3;
            it.title = "title";
            it.description = "";
            it.thumbnail = "=1e";
            it.url = "get/picture/1";
            it.visibility = getVisibilityEntity("ALWAYS")
          }),
          apply(new PictureBlockEntity(), it => {
            it.iliasId = 2;
            it.sequence = 4;
            it.title = "title 2";
            it.description = "";
            it.thumbnail = "=2e";
            it.url = "get/picture/2";
            it.visibility = getVisibilityEntity("NEVER")
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
				  apply(new VideoBlockEntity(), it => {
				    it.iliasId = 1;
				    it.sequence = 1;
				    it.url = "/get/video/1";
				    it.hash = "FB24";
				    it.visibility = getVisibilityEntity("ALWAYS");
          }),
          apply(new VideoBlockEntity(), it => {
            it.iliasId = 2;
            it.sequence = 2;
            it.url = "/get/video/2";
            it.hash = "4B8A";
            it.visibility = getVisibilityEntity("NEVER");
          })
        ];
				chai.expect(result)
          .to.be.deep.equal(expected);
			});
		});

		context("on existing video blocks", () => {

			it("should update the existing ones", () => {

        const local: Array<VideoBlockEntity> = [
          apply(new VideoBlockEntity(), it => {
            it.id = 1;
            it.iliasId = 1;
            it.sequence = 1;
            it.url = "/get/video/1";
            it.hash = "A68B";
            it.visibility = getVisibilityEntity("NEVER");
          })
        ];

        const remote: Array<VideoBlock> = [
          <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"},
          <VideoBlock>{id: 2, sequence: 2, url: "/get/video/2", hash: "4B8A", visibility: "NEVER"}
        ];


        const result: Array<VideoBlockEntity> = mapper.map(local, remote);


        const expected: Array<VideoBlockEntity> = [
          apply(new VideoBlockEntity(), it => {
            it.id = 1;
            it.iliasId = 1;
            it.sequence = 1;
            it.url = "/get/video/1";
            it.hash = "FB24";
            it.visibility = getVisibilityEntity("ALWAYS");
          }),
          apply(new VideoBlockEntity(), it => {
            it.iliasId = 2;
            it.sequence = 2;
            it.url = "/get/video/2";
            it.hash = "4B8A";
            it.visibility = getVisibilityEntity("NEVER");
          })
        ];
        chai.expect(result)
          .to.be.deep.equal(expected);
			})
		});
	});
});
