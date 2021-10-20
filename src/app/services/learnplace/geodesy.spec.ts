import {IliasCoordinates} from "./geodesy";
import {IllegalArgumentError} from "../../error/errors";

describe("a coordinates object", () => {

  const LAT_MAX: number = 85.0511287;
  const LAT_MIN: number = -85.0511287;

  const LONG_MAX: number = 180;
  const LONG_MIN: number = -180;

	describe("on creating a new instance", () => {

		describe("on more than max latitude", () => {

			it("should throw an illegal argument error", () => {

				expect(() => new IliasCoordinates(LAT_MAX + 1, 0))
          .toThrowError(IllegalArgumentError, `Value for latitude is invalid: latitude=${LAT_MAX + 1}`);
			});
		});

		describe("on less than min latitude", () => {

			it("should throw an illegal argument error", () => {

        expect(() => new IliasCoordinates(LAT_MIN - 1, 0))
          .toThrowError(IllegalArgumentError, `Value for latitude is invalid: latitude=${LAT_MIN - 1}`);
			})
		});

		describe("on more than max longitude", () => {

			it("should throw an illegal argument error", () => {

        expect(() => new IliasCoordinates(0, LONG_MAX + 1))
          .toThrowError(IllegalArgumentError, `Value for longitude is invalid: longitude=${LONG_MAX + 1}`);
			})
		});

		describe("on less than min longitude", () => {

			it("should throw an illegal argument error", () => {

        expect(() => new IliasCoordinates(0, LONG_MIN - 1))
          .toThrowError(IllegalArgumentError, `Value for longitude is invalid: longitude=${LONG_MIN - 1}`);
			})
		});
	});

  describe("on distance to other coordinates", () => {

    describe("on calculating with haversine formula", () => {

      it("should return the distance in meters", () => {

        const nebraska: IliasCoordinates = new IliasCoordinates(41.507483,  -99.436554);
        const kansas: IliasCoordinates = new IliasCoordinates(38.504048, -98.315949);


        const result: number = nebraska.distanceTo(kansas);


        const expected: number = 347426;
        expect(result)
          .toEqual(expected);
      });
    });
  });

  describe("is near to point", () => {

    describe("on distance is less than the specified radius", () => {

      it("should return true", () => {

        const bern: IliasCoordinates = new IliasCoordinates(46.94852369,  7.43607516);
        const uniBern: IliasCoordinates = new IliasCoordinates(46.95035468, 7.43782396);


        const result: boolean = bern.isNearTo(uniBern, 500);


        expect(result).toBeTrue();
      });
    });
  });
});
