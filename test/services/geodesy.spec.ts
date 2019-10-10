import {Coordinates} from "../../src/services/geodesy";
import {IllegalArgumentError} from "../../src/error/errors";

describe("a coordinates object", () => {

  const LAT_MAX: number = 85.0511287;
  const LAT_MIN: number = -85.0511287;

  const LONG_MAX: number = 180;
  const LONG_MIN: number = -180;

	describe("on creating a new instance", () => {

		context("on more than max latitude", () => {

			it("should throw an illegal argument error", () => {

				chai.expect(() => new Coordinates(LAT_MAX + 1, 0))
          .throws(IllegalArgumentError)
          .and.have.property("message", `Value for latitude is invalid: latitude=${LAT_MAX + 1}`);
			});
		});

		context("on less than min latitude", () => {

			it("should throw an illegal argument error", () => {

        chai.expect(() => new Coordinates(LAT_MIN - 1, 0))
          .throws(IllegalArgumentError)
          .and.have.property("message", `Value for latitude is invalid: latitude=${LAT_MIN - 1}`);
			})
		});

		context("on more than max longitude", () => {

			it("should throw an illegal argument error", () => {

        chai.expect(() => new Coordinates(0, LONG_MAX + 1))
          .throws(IllegalArgumentError)
          .and.have.property("message", `Value for longitude is invalid: longitude=${LONG_MAX + 1}`);
			})
		});

		context("on less than min longitude", () => {

			it("should throw an illegal argument error", () => {

        chai.expect(() => new Coordinates(0, LONG_MIN - 1))
          .throws(IllegalArgumentError)
          .and.have.property("message", `Value for longitude is invalid: longitude=${LONG_MIN - 1}`);
			})
		});
	});

  describe("on distance to other coordinates", () => {

    context("on calculating with haversine formula", () => {

      it("should return the distance in meters", () => {

        const nebraska: Coordinates = new Coordinates(41.507483,  -99.436554);
        const kansas: Coordinates = new Coordinates(38.504048, -98.315949);


        const result: number = nebraska.distanceTo(kansas);


        const expected: number = 347426;
        chai.expect(result)
          .to.be.equal(expected);
      });
    });
  });

  describe("is near to point", () => {

    context("on distance is less than the specified radius", () => {

      it("should return true", () => {

        const bern: Coordinates = new Coordinates(46.94852369,  7.43607516);
        const uniBern: Coordinates = new Coordinates(46.95035468, 7.43782396);


        const result: boolean = bern.isNearTo(uniBern, 500);


        chai.assert.isTrue(result);
      });
    });
  });
});
