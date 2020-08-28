import { Injectable } from "@angular/core";
import { default as policyList } from "../../../environments/features.json";
import { Logger } from "../logging/logging.api";
import { Logging } from "../logging/logging.service";

interface FeaturePolicies {
    disabled: Array<string>;
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
    private readonly disabledFeatures: Set<string>;

    constructor() {
        this.log.warn(() => JSON.stringify(policyList));
        const policy: FeaturePolicies = policyList;
        if (policy.disabled.length > 0) {
            this.log.info(() => `Load app feature policy, disabled: ${JSON.stringify(policy.disabled.join(" "))}`);
        } else {
            this.log.info(() => "Load app feature policy, no disabled features");
        }
        this.disabledFeatures = new Set<string>(policy.disabled);
    }

    /**
     * Checks if a feature is enabled / disabled by the current app feature policy.
     *
     * @param {string} type - The ilias type which should get checked against the feature policy.
     * @return returns true if the feature is permited by the policy, otherwise false.
     */
    isFeatureAvailable(type: string): boolean {
        const isFeatureDisabled: boolean = this.disabledFeatures.has(type);
        this.log.trace(() => `App feature policy lookup: type="${type}", disabled=${isFeatureDisabled}`)
        return !isFeatureDisabled;
    }
}
