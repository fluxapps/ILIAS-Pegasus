var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, InjectionToken } from "@angular/core";
export var OAUTH2_DATA_SUPPLIER = new InjectionToken("oauth2 data supplier");
export var TOKEN_RESPONSE_CONSUMER = new InjectionToken("token response consumer");
/**
 * Default implementation of a {@link TokenResponseConsumer}.
 *
 * This implementation does nothing and can be used, if no operation
 * should be executed.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var DefaultTokenResponseConsumer = /** @class */ (function () {
    function DefaultTokenResponseConsumer() {
    }
    DefaultTokenResponseConsumer.prototype.accept = function (token) { return Promise.resolve(); };
    DefaultTokenResponseConsumer = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], DefaultTokenResponseConsumer);
    return DefaultTokenResponseConsumer;
}());
export { DefaultTokenResponseConsumer };
//# sourceMappingURL=ilias.rest-api.js.map