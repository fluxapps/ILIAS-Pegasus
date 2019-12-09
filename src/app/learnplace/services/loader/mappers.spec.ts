import {createSpyObject} from "../../../../test.util.spec";
import {
  AccordionMapper,
  LinkBlockMapper,
  PictureBlockMapper,
  TextBlockMapper, VideoBlockMapper, VisitJournalMapper
} from "./mappers";
import {
  AccordionBlock,
  ILIASLinkBlock, JournalEntry, PictureBlock, TextBlock,
  VideoBlock
} from "../../providers/rest/learnplace.pojo";
import {TextblockEntity} from "../../entity/textblock.entity";
import {getVisibilityEntity} from "./learnplace.spec";
import {PictureBlockEntity} from "../../entity/pictureBlock.entity";
import {LinkblockEntity} from "../../entity/linkblock.entity";
import {VideoBlockEntity} from "../../entity/videoblock.entity";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
import {LearnplacePathBuilder, LearnplacePathBuilderImpl, ResourceTransfer} from "./resource";
import {File} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {AccordionEntity} from "../../entity/accordion.entity";

describe("a text block mapper", () => {

  let mapper: TextBlockMapper = new TextBlockMapper();

	beforeEach(() => {
		mapper = new TextBlockMapper();
	});

	describe("on mapping text blocks", () => {

		describe("on new text blocks", () => {

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
        expect(result).toEqual(expected);
			});
		});

		describe("on existing textblocks", () => {

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
        expect(result).toEqual(expected);
			})
		});
	});
});


describe("a picture block mapper", () => {

  const mockResourceTransfer: ResourceTransfer = <ResourceTransfer>{
    transfer: (): undefined => undefined
  };
  const mockFile: jasmine.SpyObj<File> = createSpyObject(File);
  const mockPlatform: jasmine.SpyObj<Platform> = createSpyObject(Platform);
  const mockPathBuilder: jasmine.SpyObj<LearnplacePathBuilder> = createSpyObject(LearnplacePathBuilderImpl);

  let mapper: PictureBlockMapper = new PictureBlockMapper(mockResourceTransfer, mockPathBuilder, mockFile);

	beforeEach(() => {
		mapper = new PictureBlockMapper(mockResourceTransfer, mockPathBuilder, mockFile);
	});

	describe("on mapping picture blocks", () => {

		describe("on new picture blocks", () => {

			it("should create new picture block entities and transfer its pictures", async() => {

			  const local: Array<PictureBlockEntity> = [];

			  const remote: Array<PictureBlock> = [
          <PictureBlock>{id: 1, sequence: 3, visibility: "ALWAYS", title: "title", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1e", url: "get/picture/1", hash: "=2e"},
          <PictureBlock>{id: 2, sequence: 4, visibility: "NEVER", title: "title 2", description: "",
            thumbnail: "get/thumbnail.png", thumbnailHash: "=1ea", url: "get/picture/2", hash: "=2ea"}
        ];

			  spyOn(mockResourceTransfer, "transfer")
          .and.returnValue(Promise.resolve("absolute/local/path/image.png"));


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
			  expect(result).toEqual(expected, `Expected: ${JSON.stringify(expected)}, but was: ${JSON.stringify(result)}`);
			});
		});

		describe("on existing picture blocks", () => {

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

        spyOn(mockResourceTransfer, "transfer")
          .and.returnValue(Promise.resolve("absolute/local/path/image.png"));


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
        expect(result).toEqual(expected);
			})
		});

		describe("on updated pictures", () => {

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

        spyOn(mockResourceTransfer, "transfer").and.returnValue(Promise.resolve("absolute/local/path/image.png"));

        mockPlatform.is
          .withArgs("ios") // just to use mock the File correct
          .and.returnValue(true);
        spyOnProperty(mockFile, "dataDirectory") // ios uses this property
          .and.returnValue("test/");
        const deleteStub: jasmine.Spy = mockFile.removeFile;
        deleteStub.and.returnValue(Promise.resolve());


        await mapper.map(local, remote);


        expect(deleteStub).toHaveBeenCalledTimes(2);
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

		describe("on new link blocks", () => {

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
        expect(result).toEqual(expected);
			});
		});

		describe("on existing link blocks", () => {

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
        expect(result).toEqual(expected);
			})
		});
	});
});

describe("a video block mapper", () => {

  const mockResourceTransfer: ResourceTransfer = <ResourceTransfer>{
    transfer: (): undefined => undefined
  };
  const mockFile: jasmine.SpyObj<File> = createSpyObject(File);
  const mockPlatform: jasmine.SpyObj<Platform> = createSpyObject(Platform);
  const mockPathBuilder: jasmine.SpyObj<LearnplacePathBuilder> = createSpyObject(LearnplacePathBuilderImpl);

  let mapper: VideoBlockMapper = new VideoBlockMapper(mockResourceTransfer, mockFile, mockPathBuilder);

	beforeEach(() => {
		mapper = new VideoBlockMapper(mockResourceTransfer, mockFile, mockPathBuilder);
	});

	describe("on mapping video blocks", () => {

		describe("on new video blocks", () => {

			it("should create new video block entities", async() => {

				const local: Array<VideoBlockEntity> = [];

				const remote: Array<VideoBlock> = [
				  <VideoBlock>{id: 1, sequence: 1, url: "/get/video/1", hash: "FB24", visibility: "ALWAYS"},
          <VideoBlock>{id: 2, sequence: 2, url: "/get/video/2", hash: "4B8A", visibility: "NEVER"}
        ];

				spyOn(mockResourceTransfer, "transfer").and.returnValue(Promise.resolve("absolute/path/image.png"));


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
				expect(result).toEqual(expected);
			});
		});

		describe("on existing video blocks", () => {

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

        spyOn(mockResourceTransfer, "transfer")
          .and.returnValue(Promise.resolve("absolute/path/image.png"));


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
        expect(result).toEqual(expected);
			})
		});

		describe("on updated video", () => {

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

        spyOn(mockResourceTransfer, "transfer")
          .and.returnValue(Promise.resolve("absolute/path/image.png"));

        mockPlatform.is
          .withArgs("ios") // just to use mock the File correct
          .and.returnValue(true);
        spyOnProperty(mockFile, "dataDirectory") // ios uses this property
          .and.returnValue("test/");
        const deleteStub: jasmine.Spy = mockFile.removeFile;
        deleteStub.and.returnValue(Promise.resolve());


        await mapper.map(local, remote);


        expect(deleteStub).toHaveBeenCalledTimes(1);
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

		describe("on new journal entries", () => {

			it("should create new journal entities", async() => {

				const local: Array<VisitJournalEntity> = [];

				const remote: Array<JournalEntry> = [
				  <JournalEntry>{
				    userId: 1,
            timestamp: 0
          },
          <JournalEntry>{
				    userId: 2,
            timestamp: 0
          }
        ];


				const result: Array<VisitJournalEntity> = await mapper.map(local, remote);


				const expected: Array<VisitJournalEntity> = [
				  new VisitJournalEntity().applies(function(): void {
				    this.userId = 1;
				    this.time = 0;
				    this.synchronized = true;
          }),
          new VisitJournalEntity().applies(function(): void {
            this.userId = 2;
            this.time = 0;
            this.synchronized = true;
          })
        ];

				expect(result).toEqual(expected);
			});
		});

		describe("on existing journal entries", () => {

			it("should update the existing journal entities", async() => {

        const local: Array<VisitJournalEntity> = [
          new VisitJournalEntity().applies(function(): void {
            this.id = 1;
            this.userId = 1;
            this.time = 0;
            this.synchronized = true;
          }),
          new VisitJournalEntity().applies(function(): void {
            this.userId = 2;
            this.time = 0;
            this.synchronized = true;
          })
        ];

        const remote: Array<JournalEntry> = [
          <JournalEntry>{
            userId: 1,
            timestamp: 0
          },
          <JournalEntry>{
            userId: 2,
            timestamp: 0
          }
        ];


        const result: Array<VisitJournalEntity> =await mapper.map(local, remote);


        const expected: Array<VisitJournalEntity> = [
          new VisitJournalEntity().applies(function(): void {
            this.id = 1;
            this.userId = 1;
            this.time = 0;
            this.synchronized = true;
          }),
          new VisitJournalEntity().applies(function(): void {
            this.userId = 2;
            this.time = 0;
            this.synchronized = true;
          })
        ];

        expect(result).toEqual(expected);
			})
		});
	});
});

describe("a accordion mapper", () => {

    const mockTextMapper: jasmine.SpyObj<TextBlockMapper> = createSpyObject(TextBlockMapper);
    const mockPictureMapper: jasmine.SpyObj<PictureBlockMapper> = createSpyObject(PictureBlockMapper);
    const mockLinkMapper: jasmine.SpyObj<LinkBlockMapper> = createSpyObject(LinkBlockMapper);
    const mockVideoMapper: jasmine.SpyObj<VideoBlockMapper> = createSpyObject(VideoBlockMapper);

    let mapper: AccordionMapper = new AccordionMapper(mockTextMapper, mockPictureMapper, mockLinkMapper, mockVideoMapper);

    beforeEach(() => {
        mapper = new AccordionMapper(mockTextMapper, mockPictureMapper, mockLinkMapper, mockVideoMapper);
    });

    describe("mapping accordion blocks", () => {

        describe("on new accordion blocks", () => {

            it("should create new accordion entities", async() => {

                const local: Array<AccordionEntity> = [];

                const remote: Array<AccordionBlock> = [
                    <AccordionBlock>{id: 1, sequence: 1, title: "title", expanded: true, visibility: "ALWAYS", text: [
                            <TextBlock>{id: 1, sequence: 1, content: "", visibility: "ALWAYS"}
                        ]},
                    <AccordionBlock>{id: 2, sequence: 2, title: "title", expanded: true, visibility: "ALWAYS", text: [
                            <TextBlock>{id: 2, sequence: 1, content: "", visibility: "ALWAYS"}
                        ]}
                ];

                // We do not resolve the entities, we only want to check if the mapper is called
                const textMapperStub: jasmine.Spy = mockTextMapper.map;
                textMapperStub.and.returnValue(Promise.resolve([]));

                const pictureMapperStub: jasmine.Spy = mockPictureMapper.map;
                pictureMapperStub.and.returnValue(Promise.resolve([]));

                const linkMapperStub: jasmine.Spy = mockLinkMapper.map;
                linkMapperStub.and.returnValue(Promise.resolve([]));

                const videoMapperStub: jasmine.Spy = mockVideoMapper.map;
                videoMapperStub.and.returnValue(Promise.resolve([]));


                const result: Array<AccordionEntity> = await mapper.map(local, remote);


                // because we resolve undefined on the block mappers, we set undefined on any block of an accordion
                const expected: Array<AccordionEntity> = [
                    new AccordionEntity().applies(function(): void {
                        this.iliasId = 1;
                        this.sequence = 1;
                        this.title = "title";
                        this.expanded = true;
                        this.visibility = getVisibilityEntity("ALWAYS");
                        this.textBlocks = [];
                        this.pictureBlocks = [];
                        this.linkBlocks = [];
                        this.videoBlocks = [];
                    }),
                    new AccordionEntity().applies(function(): void {
                        this.iliasId = 2;
                        this.sequence = 2;
                        this.title = "title";
                        this.expanded = true;
                        this.visibility = getVisibilityEntity("ALWAYS");
                        this.textBlocks = [];
                        this.pictureBlocks = [];
                        this.linkBlocks = [];
                        this.videoBlocks = [];
                    })
                ];
                expect(result)
                    .toEqual(expected, `Expected: ${JSON.stringify(expected)}, but was: ${JSON.stringify(result)}`);

                expect(textMapperStub).toHaveBeenCalledTimes(2);
                expect(pictureMapperStub).toHaveBeenCalledTimes(2);
                expect(linkMapperStub).toHaveBeenCalledTimes(2);
                expect(videoMapperStub).toHaveBeenCalledTimes(2);
            });
        });

        describe("on existing accordion blocks", () => {

            it("should update the existing accordion entities", async() => {

                const local: Array<AccordionEntity> = [
                    new AccordionEntity().applies(function(): void {
                        this.id = 1;
                        this.iliasId = 1;
                        this.sequence = 1;
                        this.title = "title";
                        this.expanded = true;
                        this.visibility = getVisibilityEntity("NEVER");
                        this.textBlocks = [];
                        this.pictureBlocks = [];
                        this.linkBlocks = [];
                        this.videoBlocks = [];
                    })
                ];

                const remote: Array<AccordionBlock> = [
                    <AccordionBlock>{id: 1, sequence: 1, title: "title", expanded: true, visibility: "ALWAYS", text: [
                            <TextBlock>{id: 1, sequence: 1, content: "", visibility: "ALWAYS"}
                        ]},
                    <AccordionBlock>{id: 2, sequence: 2, title: "title", expanded: true, visibility: "ALWAYS", text: [
                            <TextBlock>{id: 2, sequence: 1, content: "", visibility: "ALWAYS"}
                        ]}
                ];

                // We do not resolve the entities, we only want to check if the mapper is called
                const textMapperStub: jasmine.Spy = mockTextMapper.map;
                textMapperStub.and.returnValue([]);

                const pictureMapperStub: jasmine.Spy = mockPictureMapper.map;
                pictureMapperStub.and.returnValue([]);

                const linkMapperStub: jasmine.Spy = mockLinkMapper.map;
                linkMapperStub.and.returnValue(Promise.resolve([]));
                const videoMapperStub: jasmine.Spy = mockVideoMapper.map;
                videoMapperStub.and.returnValue(Promise.resolve([]));


                const result: Array<AccordionEntity> = await mapper.map(local, remote);


                // because we resolve undefined on the block mappers, we set undefined on any block of an accordion
                const expected: Array<AccordionEntity> = [
                    new AccordionEntity().applies(function(): void {
                        this.id = 1;
                        this.iliasId = 1;
                        this.sequence = 1;
                        this.title = "title";
                        this.expanded = true;
                        this.visibility = getVisibilityEntity("ALWAYS");
                        this.textBlocks = [];
                        this.pictureBlocks = [];
                        this.linkBlocks = [];
                        this.videoBlocks = [];
                    }),
                    new AccordionEntity().applies(function(): void {
                        this.iliasId = 2;
                        this.sequence = 2;
                        this.title = "title";
                        this.expanded = true;
                        this.visibility = getVisibilityEntity("ALWAYS");
                        this.textBlocks = [];
                        this.pictureBlocks = [];
                        this.linkBlocks = [];
                        this.videoBlocks = [];
                    })
                ];
                expect(result).toEqual(expected, `Expected: ${JSON.stringify(expected)}, but was: ${JSON.stringify(result)}`);

                expect(textMapperStub).toHaveBeenCalledTimes(2);
                expect(pictureMapperStub).toHaveBeenCalledTimes(2);
                expect(linkMapperStub).toHaveBeenCalledTimes(2);
                expect(videoMapperStub).toHaveBeenCalledTimes(2);
            })
        });
    });
});
