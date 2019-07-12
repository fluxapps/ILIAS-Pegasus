import { Logging } from "./app/services/logging/logging.service";
/**
 * Needs to be executed somewhere during the bootstrap process
 * in order to load the declarations in this module.
 *
 * For tests, call this function before you are loading the tests.
 * e.g. your shim.js
 *
 * For production, call this function in the bootstrap process
 * e.g. your main.ts
 */
export function useStandard() {
    Logging.getLogger("useStandard").debug(function () { return "standard.ts loaded"; });
}
Object.defineProperties(Object.prototype, {
    applies: {
        value: function (block) {
            block.apply(this);
            return this;
        },
        writable: true
    },
    also: {
        value: function (block) {
            block(this);
            return this;
        },
        writable: true
    },
    letIt: {
        value: function (block) {
            return block(this);
        },
        writable: true
    },
    takeIf: {
        value: function (predicate) {
            return (predicate(this) ? this : undefined);
        },
        writable: true
    },
    takeUnless: {
        value: function (predicate) {
            return (predicate(this) ? undefined : this);
        },
        writable: true
    }
});
//# sourceMappingURL=standard.js.map