import {environment} from "../environments/environment";

/**
 * Returns true if the dev mode is enabled, otherwise returns false.
 *
 * The app is considered to run in dev mode if one of the following conditions are met:
 * - If environment.production is set to false.
 *
 * @returns {boolean} true if the pegasus dev mode is enabled, otherwise false.
 */
export function isDevMode(): boolean {
    return !environment.production;
}
