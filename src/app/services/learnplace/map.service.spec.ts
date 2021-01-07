import {
  CameraOptions,
  GeoCoordinate, MapBuilder, MapEvaluationError
} from "./map.service";

describe("a map builder", () => {

	describe("on building the map", () => {

		describe("on missing camera position", () => {

			it("should throw an map evaluation error", async() => {

				// Arrange
        const builder: MapBuilder = new MapBuilder();

				// Assert
        await expectAsync(builder.build()) // Act
          .toBeRejectedWithError(MapEvaluationError, "Can not build map: Requires camera position");
			});
		});

		describe("on missing binding element", () => {

			it("should throw an map evaluation error", async() => {

				// Arrange
        const builder: MapBuilder = new MapBuilder();
        builder.camera(<CameraOptions>{position: <GeoCoordinate>{longitude: 500, latitude: 500}});

				// Assert
        await expectAsync(builder.build()) // Act
          .toBeRejectedWithError(MapEvaluationError, "Can not build map: Requires a node to bind the map");
			})
		});
	});
});
