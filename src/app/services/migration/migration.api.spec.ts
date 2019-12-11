import {MigrationVersion, MigrationVersionError} from "./migration.api";

describe("a migration version", () => {

	describe("create a valid version", () => {

		describe("with one version number", () => {

			it("should return the version number", () => {

        const version: MigrationVersion = new MigrationVersion("V__1");


        expect(version.getVersion()).toEqual(1);
			});
		});

		describe("with more than one version number", () => {

			it("should return the full version number", () => {

        const version: MigrationVersion = new MigrationVersion("V__114");


        expect(version.getVersion()).toEqual(114);
			})
		});
	});

  describe("create a invalid version", () => {

    describe("with invalid version number", () => {

      it("should throw a MigrationVersionError", () => {

        expect(() => new MigrationVersion("invalid number"))
          .toThrowError(MigrationVersionError, "Invalid version number: invalid number");
      });
    });
  });
});
