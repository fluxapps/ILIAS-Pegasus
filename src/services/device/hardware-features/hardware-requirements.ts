import {HardwareRequirement} from "./hardware-feature.service";

/**
 * Hardware requirement for the location.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class LocationRequirement implements HardwareRequirement {


  onFailure(action: () => void): HardwareRequirement {
    return null;
  }

  check(): Promise<void> {
    return null;
  }
}

/**
 * Hardware requirement for wifi.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class WifiRequirement implements HardwareRequirement {


  onFailure(action: () => void): HardwareRequirement {
    return null;
  }

  check(): Promise<void> {
    return null;
  }
}

/**
 * ANDROID ONLY!!!
 *
 * Hardware requirement for roaming service.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class RoamingRequirement implements HardwareRequirement {


  onFailure(action: () => void): HardwareRequirement {
    return null;
  }

  check(): Promise<void> {
    return null;
  }
}

/**
 * Collection of hardware requirements where at least one of the requirements must be fulfilled.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class AnyRequirement implements HardwareRequirement {


  onFailure(action: () => void): HardwareRequirement {
    return null;
  }

  check(): Promise<void> {
    return null;
  }
}

/**
 * Collection of hardware requirements where all requirements must be fulfilled.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class AllRequirement implements HardwareRequirement {


  onFailure(action: () => void): HardwareRequirement {
    return null;
  }

  check(): Promise<void> {
    return null;
  }
}
