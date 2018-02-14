import {IllegalArgumentError} from "../error/errors";

/**
 * Provides Geodesy functions for working with points and paths on
 * a spherical-model earth.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.2
 */
export class Coordinates {

  constructor(
    readonly latitude: number,
    readonly longitude: number
  ) {
    if (latitude < -85.0511287 || latitude > 85.0511287) {
      throw new IllegalArgumentError(`Value for latitude is invalid: latitude=${latitude}`);
    }

    if (longitude < -180 || longitude > 180) {
      throw new IllegalArgumentError(`Value for longitude is invalid: longitude=${longitude}`);
    }
  }

  distanceTo(point: Coordinates): number {

    const [pi, asin, sin, cos, sqrt, pow, round]: [number, Asin, Sin, Cos, Sqrt, Pow, Round] =
    [Math.PI, Math.asin, Math.sin, Math.cos, Math.sqrt, Math.pow, Math.round];

    const [fromLat, fromLong, toLat, toLong]: Array<number> = [this.latitude, this.longitude, point.latitude, point.longitude].map(x => x / 180 * pi);

    const [dLat, dLong, radius]: Array<number> = [toLat - fromLat, toLong - fromLong, 6372.8];

    return round(
      radius * 2 * asin(
        sqrt(
          pow(sin(dLat / 2), 2) +
          pow(sin(dLong / 2), 2) *
          cos(fromLat) * cos(toLat)
        )
      ) * 1000
    );
  }

  isNearTo(point: Coordinates, radius: number): boolean {
    return this.distanceTo(point) <= radius;
  }
}

// type pointer for the math functions used
interface Asin { (x: number): number }
interface Sin { (x: number): number }
interface Cos { (x: number): number }
interface Sqrt { (x: number): number }
interface Round { (x: number): number }
interface Pow { (x: number, y: number): number }
