import {IllegalArgumentError} from "../../error/errors";

// destruct Math functions to variables for improved readability
const [pi, asin, sin, cos, sqrt, pow, round]: [number, Asin, Sin, Cos, Sqrt, Pow, Round] =
  [Math.PI, Math.asin, Math.sin, Math.cos, Math.sqrt, Math.pow, Math.round];

// type pointer for the math functions used
interface Asin { (x: number): number }
interface Sin { (x: number): number }
interface Cos { (x: number): number }
interface Sqrt { (x: number): number }
interface Round { (x: number): number }
interface Pow { (x: number, y: number): number }

const EARTH_RADIUS: number = 6372.8;
const MAX_LAT: number = 85.0511287;
const MIN_LAT: number = -85.0511287;
const MAX_LONG: number = 180;
const MIN_LONG: number = -180;

/**
 * Provides Geodesy functions for working with points and paths on
 * a spherical-model earth.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class IliasCoordinates {

  /**
   * Creates a new Coordinate with the given latitude and longitude.
   *
   * The latitude has a maximum size of 85.0511287 and a minimum size of -85.0511287.
   * The longitude has a maximum size of 180 and a minimum size of -180.
   *
   * @param {number} latitude - latitude in degrees
   * @param {number} longitude - longitude in degrees
   */
  constructor(
    readonly latitude: number,
    readonly longitude: number
  ) {
    if (latitude < MIN_LAT || latitude > MAX_LAT) {
      throw new IllegalArgumentError(`Value for latitude is invalid: latitude=${latitude}`);
    }

    if (longitude < MIN_LONG || longitude > MAX_LONG) {
      throw new IllegalArgumentError(`Value for longitude is invalid: longitude=${longitude}`);
    }
  }

  /**
   * Calculates the distance of this coordinates to the given {@code point}, by using the haversine formula.
   * @see https://rosettacode.org/wiki/Haversine_formula#ES6
   *
   * @param {Coordinates} point - the coordinates to calculate the distance to
   *
   * @returns {number} the distance in meters
   */
  distanceTo(point: IliasCoordinates): number {

    const [fromLat, fromLong, toLat, toLong]: Array<number> = [this.latitude, this.longitude, point.latitude, point.longitude].map(toRadiant);

    const [dLat, dLong]: Array<number> = [toLat - fromLat, toLong - fromLong];

    return round(
      EARTH_RADIUS * 2 * asin(
        sqrt(
          pow(sin(dLat / 2), 2) +
          pow(sin(dLong / 2), 2) *
          cos(fromLat) * cos(toLat)
        )
      ) * 1000
    );
  }

  /**
   * Returns true, if the given {@code point} is inside the given {@code radius} of this coordinates, otherwise false.
   *
   * The distance between the given {@code point} and this coordinates is calculated and than compared to the given {@code radius}.
   * If the distance is equal or less than the radius, the {@code point} is considered as 'near' and true will be returned.
   *
   * @param {Coordinates} point - the coordinates to check
   * @param {number} radius - tolerance in meters of this coordinates
   *
   * @returns {boolean} true if the {@code point} is in the radius of this coordinates, otherwise false
   */
  isNearTo(point: IliasCoordinates, radius: number): boolean {
    return this.distanceTo(point) <= radius;
  }
}

/**
 * Calculates the given {@code x} number from degrees to radians.
 *
 * @param {number} x - the number in degrees
 *
 * @returns {number} the radiant value
 */
function toRadiant(x: number): number {
  return x / 180 * pi;
}
