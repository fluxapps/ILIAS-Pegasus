import {
  VisibilityAware,
  VisibilityStrategyApplier
} from "../../../../src/learnplace/services/visibility/visibility.context";
import {SinonSandbox, createSandbox, SinonStub, assert} from "sinon";
import {
  AfterVisitPlaceStrategy,
  AlwaysStrategy, NeverStrategy,
  OnlyAtPlaceStrategy, VisibilityStrategyType
} from "../../../../src/learnplace/services/visibility/visibility.strategy";
import {stubInstance} from "../../../SinonUtils";
import {IllegalStateError} from "../../../../src/error/errors";

describe("a visibility strategy applier", () => {

 const sandbox: SinonSandbox = createSandbox();

 const mockAlwaysStrategy: AlwaysStrategy = stubInstance(AlwaysStrategy);
 const mockNeverStrategy: NeverStrategy = stubInstance(NeverStrategy);
 const mockOnlyAtPlaceStrategy: OnlyAtPlaceStrategy = stubInstance(OnlyAtPlaceStrategy);
 const mockAfterVisitPlaceStrategy: AfterVisitPlaceStrategy = stubInstance(AfterVisitPlaceStrategy);

 let applier: VisibilityStrategyApplier = new VisibilityStrategyApplier(
   mockAlwaysStrategy, mockNeverStrategy, mockOnlyAtPlaceStrategy, mockAfterVisitPlaceStrategy
 );

	beforeEach(() => {
		applier = new VisibilityStrategyApplier(
      mockAlwaysStrategy, mockNeverStrategy, mockOnlyAtPlaceStrategy, mockAfterVisitPlaceStrategy
    );
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe("apply strategy", () => {

		context("strategy which requires a learnplace", () => {

			it("should throw an illegal state error", () => {

			  const mockModel: VisibilityAware = <VisibilityAware>{
			    visible: true
        };

				chai.expect(() => applier.apply(mockModel, VisibilityStrategyType.ONLY_AT_PLACE))
          .to.throw(IllegalStateError)
          .and.have.property("message", "Can not apply strategy without learnplace id: Call VisibilityStrategyApplier#setLearnplace first");
			});
		});

		context("strategy which requires no learnplace", () => {

			it("should apply the strategy", () => {

        const mockModel: VisibilityAware = <VisibilityAware>{
          visible: true
        };

        const applyStub: SinonStub = sandbox.stub(mockAlwaysStrategy, "on");


        applier.apply(mockModel, VisibilityStrategyType.ALWAYS);


        assert.calledOnce(applyStub);
			})
		});
	});
});
