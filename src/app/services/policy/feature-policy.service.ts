import { Injectable } from "@angular/core";
import { default as policyList } from "../../../environments/features.json";
import { Logger } from "../logging/logging.api";
import { Logging } from "../logging/logging.service";

interface FeaturePolicies {
    disabled: Array<string>;
    customeTheme?: boolean;
}

export enum Features {
    CUSTOM_THEME = "customTheme"
}

/**
 * This class provides information if a type can be handled by the app it self.
 * However this class is only concerned about features which are disabled by feature policy.
 *
 * Every logic in the app has to check if a feature is disabled by policy or not.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
@Injectable({
    providedIn: "root"
})
export class FeaturePolicyService {

    private readonly log: Logger = Logging.getLogger("FeaturePolicyService");
    private readonly policy: FeaturePolicies;
    private readonly disabledFeatures: Set<string>;

    constructor() {
        this.log.warn(() => JSON.stringify(policyList));
        this.policy = policyList;

        if (this.policy.disabled.length > 0) {
            this.log.info(() => `Load app object policy, disabled: ${JSON.stringify(this.policy.disabled.join(" "))}`);
        } else {
            this.log.info(() => "Load app object policy, no disabled ILIAS Object features");
        }

        this.disabledFeatures = new Set<string>(this.policy.disabled);
    }

    /**
     * Checks if a ILIAS Object is enabled / disabled by the current app feature policy.
     *
     * @param {string} type - The ilias type which should get checked against the feature policy.
     * @return returns true if the object is permited by the policy, otherwise false.
     */
    isObjectAvailable(type: string): boolean {
        const available: boolean = !this.disabledFeatures.has(type);

        this.log.trace(() => `App feature policy lookup: object="${type}" ${available ? "enabled" : "disabled"}`)
        return available;
    }

    /**
     * Checks if a ILIAS Feature is enabled / disabled by the current app feature policy.
     *
     * @param {Features} type - The feature which should get checked against the feature policy.
     * @return returns true if the feature is permited by the policy, otherwise false.
     */
    isFeatureAvailable(type: Features): boolean {
        return !!this.policy[type];
    }
}
