import {SinonSandbox, createSandbox} from "sinon";
import * as chaiAsPromised from "chai-as-promised";

// enables promise assert with chai
chai.use(chaiAsPromised);

// Example class / interface
interface TestDependency {

  test(): boolean

  testAsync(): Promise<boolean>
}

class TestService {

  constructor(
    private readonly dependency: TestDependency
  ) {}

  runTest(): string {

    if (this.dependency.test()) {
      return "The dependency test was successful";
    }

    return "The dependency test failed";
  }

  async runAsyncTest(): Promise<string> {

    try {
      const test: boolean = await this.dependency.testAsync();

      if (test) {
        return Promise.resolve("The dependency async test was successful");
      }

      return Promise.resolve("The dependency async test failed");
    } catch (error) {
      throw Error("Could not finish the test.");
    }
  }
}

// Specification
describe("a test service", () => {

  const sandbox: SinonSandbox = createSandbox();

  const mockDependency: TestDependency = <TestDependency>{
    test: (): boolean => undefined,
    testAsync: (): Promise<boolean> => undefined
  };

  let service: TestService = new TestService(mockDependency);

  beforeEach(() => {
    service = new TestService(mockDependency);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("on a test run", () => {

    context("on successful test dependency", () => {

      it("should return a message that the test was successful", () => {

        // Arrange
        sandbox.stub(mockDependency, "test")
          .returns(true);

        // Act
        const result: string = service.runTest();

        // Assert
        const expected: string = "The dependency test was successful";
        chai.expect(result)
          .to.be.equal(expected);
      });
    });

    context("on failed test dependency", () => {

      it("should return a message that the test failed", () => {

        // Arrange
        sandbox.stub(mockDependency, "test")
          .returns(false);

        // Act
        const result: string = service.runTest();

        // Assert
        const expected: string = "The dependency test failed";
        chai.expect(result)
          .to.be.equal(expected);
      });
    });
  });

  describe("on async test run", () => {

    context("on successful test dependency", () => {

      it("should return a message that the test was successful", async() => {

        // Arrange
        sandbox.stub(mockDependency, "testAsync")
          .resolves(true);

        // Act
        const result: string = await service.runAsyncTest();

        // Assert
        const expected: string = "The dependency async test was successful";
        chai.expect(result)
          .to.be.equal(expected);
      })
    });

    context("on failed test dependency", () => {

    	it("should return a message that the test failed", async() => {

    		// Arrange
        sandbox.stub(mockDependency, "testAsync")
          .resolves(false);

    		// Act
        const result: string = await service.runAsyncTest();

    		// Assert
        const expected: string = "The dependency async test failed";
        chai.expect(result)
          .to.be.equal(expected);
    	})
    });

    context("on rejected dependency", () => {

    	it("should throw an error", (done) => {

    		// Arrange
        sandbox.stub(mockDependency, "testAsync")
          .throws(Error);

    		// Act
        const result: () => Promise<void> = async(): Promise<void> => { await service.runAsyncTest() };

    		// Assert
        chai.expect(result())
          .to.be.rejectedWith(Error)
          .and.eventually.have.property("message", "Could not finish the test.")
          .notify(done);
    	})
    });
  });
});
