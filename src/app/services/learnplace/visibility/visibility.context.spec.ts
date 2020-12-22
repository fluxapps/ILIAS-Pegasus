import {createSpyObject} from "../../../../test.util.spec";
import {
  VisibilityAware,
  VisibilityStrategyApplier
} from "./visibility.context";
import {
  AfterVisitPlaceStrategy,
  AlwaysStrategy, NeverStrategy,
  OnlyAtPlaceStrategy, VisibilityStrategyType
} from "./visibility.strategy";
import {IllegalStateError} from "../../../error/errors";

describe("a visibility strategy applier", () => {

 const mockAlwaysStrategy: jasmine.SpyObj<AlwaysStrategy> = createSpyObject(AlwaysStrategy);
 const mockNeverStrategy: jasmine.SpyObj<NeverStrategy> = createSpyObject(NeverStrategy);
 const mockOnlyAtPlaceStrategy: jasmine.SpyObj<OnlyAtPlaceStrategy> = createSpyObject(OnlyAtPlaceStrategy);
 const mockAfterVisitPlaceStrategy: jasmine.SpyObj<AfterVisitPlaceStrategy> = createSpyObject(AfterVisitPlaceStrategy);

 let applier: VisibilityStrategyApplier = new VisibilityStrategyApplier(
   mockAlwaysStrategy, mockNeverStrategy, mockOnlyAtPlaceStrategy, mockAfterVisitPlaceStrategy
 );

	beforeEach(() => {
		applier = new VisibilityStrategyApplier(
      mockAlwaysStrategy, mockNeverStrategy, mockOnlyAtPlaceStrategy, mockAfterVisitPlaceStrategy
    );
	});

	describe("apply strategy", () => {

		describe("strategy which requires a learnplace", () => {

			it("should throw an illegal state error", () => {

			  const mockModel: VisibilityAware = <VisibilityAware>{
			    visible: true
        };

				expect(() => applier.apply(mockModel, VisibilityStrategyType.ONLY_AT_PLACE))
          .toThrowError(IllegalStateError, "Can not apply strategy without learnplace id: Call VisibilityStrategyApplier#setLearnplace first");
			});
		});

		describe("strategy which requires no learnplace", () => {

			it("should apply the strategy", () => {

        const mockModel: VisibilityAware = <VisibilityAware>{
          visible: true
        };

        const applyStub: jasmine.Spy = mockAlwaysStrategy.on;


        applier.apply(mockModel, VisibilityStrategyType.ALWAYS);


        expect(applyStub).toHaveBeenCalledTimes(1);
			})
		});
	});
});
