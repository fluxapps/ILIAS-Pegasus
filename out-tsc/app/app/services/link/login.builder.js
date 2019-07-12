var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, InjectionToken } from "@angular/core";
import { IllegalStateError } from "../../error/errors";
export var LOGIN_LINK_BUILDER = new InjectionToken("token for login link builder factory");
var LoginLinkBuilderImpl = /** @class */ (function () {
    function LoginLinkBuilderImpl() {
        this.installationUrl = "";
        this.clientIdentifier = "";
    }
    /**
     * Sets the installation url which should be used to build the login page link.
     *
     * @param {string} url          The installation url for example "https://ilias.de"
     * @returns {LoginLinkBuilder}  The builder it self for fluent call chaining.
     */
    LoginLinkBuilderImpl.prototype.installation = function (url) {
        this.installationUrl = url;
        return this;
    };
    /**
     * Sets the client id of the installation.
     *
     * @param {string} id           The client id which should be used, for example default.
     * @returns {LoginLinkBuilder}  The builder it self for fluent call chaining.
     */
    LoginLinkBuilderImpl.prototype.clientId = function (id) {
        this.clientIdentifier = id;
        return this;
    };
    /**
     * Build the login page link for the pegasus redirects.
     *
     * @returns {Promise<string>} The login link which points to the selected installation.
     * @throws {IllegalStateError} Thrown if the builder needs more data to build the link.
     */
    LoginLinkBuilderImpl.prototype.build = function () {
        this.validateBuilderState();
        return this.installationUrl + "/login.php?target=ilias_app_login_page&client_id=" + this.clientIdentifier;
    };
    /**
     * Validates the state of the builder.
     * If the builder is not ready for the build state
     * an error will be thrown.
     */
    LoginLinkBuilderImpl.prototype.validateBuilderState = function () {
        if (this.installationUrl === "")
            throw new IllegalStateError("Required installation was not found, ILIAS login link build failed.");
        if (this.clientIdentifier === "")
            throw new IllegalStateError("Required client id was not found, ILIAS login link build failed.");
    };
    LoginLinkBuilderImpl = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], LoginLinkBuilderImpl);
    return LoginLinkBuilderImpl;
}());
export { LoginLinkBuilderImpl };
//# sourceMappingURL=login.builder.js.map