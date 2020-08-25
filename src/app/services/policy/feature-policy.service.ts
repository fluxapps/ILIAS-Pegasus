import { Injectable } from "@angular/core";
import * as policyList from "../../../environments/features.json";

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

    private readonly disabledFeatures: Set<string> = new Set<string>(policyList.disabled);

    /**
     * Checks if a feature is enabled / disabled by the current app feature policy.
     *
     * @param {string} type - The ilias type which should get checked against the feature policy.
     * @return returns true if the feature is permited by the policy, otherwise false.
     */
    isFeatureAvailable(type: string): boolean {
        return !this.disabledFeatures.has(type);
    }
}
