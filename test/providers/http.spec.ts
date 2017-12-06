import {createSandbox, SinonSandbox} from "sinon";
import {HttpResponse, JsonValidationError} from "../../src/providers/http";
import {Response} from "@angular/http";
import {stubInstance} from "../SinonUtils";

describe("a http response", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockResponse: Response = stubInstance(Response);

  let httpResponse: HttpResponse = new HttpResponse(mockResponse);

	beforeEach(() => {
    httpResponse = new HttpResponse(mockResponse);
	});

	afterEach(() => {
    sandbox.restore();
	});

	describe("a json schema to validate", () => {

    const schema: object = {
      "title": "Testschema",
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "minimum": "1"
        },
        "name": {
          "type": "string"
        },
      },
      "required": ["id", "name"]
    };

		context("on valid json", () => {

			it("should return the json as object", () => {

				// Arrange
        const object: object = {
          "id": 1,
          "name": "a test"
        };
        sandbox.stub(mockResponse, "json")
          .returns(object);

				// Act
        const json: object = httpResponse.json(schema);

				// Assert
        chai.expect(json)
          .to.be.deep.equal(object);
			});
		});

		context("on json does not match schema", () => {

			it("should throw a json validation error", () => {

				// Arrange
        const object: object = {
          "foo": 1
        };
        sandbox.stub(mockResponse, "json")
          .returns(object);

				// Assert
        chai.expect((): void => { httpResponse.json(schema) })
          .to.throw(JsonValidationError)
          .to.have.property("message", 'requires property "id"')
			})
		});

		context("on response body is not json", () => {

			it("should throw a json validation error", () => {

				// Arrange
        sandbox.stub(mockResponse, "json")
          .throws(Error);

				// Assert
        chai.expect((): void => { httpResponse.json(schema) })
          .to.throw(JsonValidationError)
          .to.have.property("message", "Could not parse response body to json")
			})
		});
	});
});
