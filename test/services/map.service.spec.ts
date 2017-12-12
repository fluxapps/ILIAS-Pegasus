import {
  GeoCoordinate, MapBuilder, MapEvaluationError,
  StandardMap
} from "../../src/services/map.service";
import * as chaiAsPromised from "chai-as-promised";

// enables promise assert with chai
chai.use(chaiAsPromised);

describe("a map builder", () => {

	describe("on building the map", () => {

		context("on missing camera position", () => {

			it("should throw an map evaluation error", (done) => {

				// Arrange
        const builder: MapBuilder = new MapBuilder();

				// Assert
        chai.expect(builder.build()) // Act
          .to.be.rejectedWith(MapEvaluationError)
          .to.eventually.have.property("message", "Can not build map: Requires camera position")
          .notify(done)
			});
		});

		context("on missing binding element", () => {

			it("should throw an map evaluation error", (done) => {

				// Arrange
        const builder: MapBuilder = new MapBuilder();
        builder.camera(<GeoCoordinate>{longitude: 500, latitude: 500});

				// Assert
        chai.expect(builder.build()) // Act
          .to.be.rejectedWith(MapEvaluationError)
          .to.eventually.have.property("message", "Can not build map: Requires a node to bind the map")
          .notify(done);
			})
		});
	});
});
