---
title: Google Map
menuHeading: UI
authors:
    - nmaerchy
sections:
    - Map builder
---

# Map builder

To display a map in ILIAS Pegasus, you can use the `MappBuilder` class.

```typescript
import {AfterViewInit, Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {GeoCoordinate, MapBuilder} from "../../../services/map.service";
 
@Component({
    selector: "map",
    templateUrl: "map.html"
})
export class MapPage implements AfterViewInit{
 
  constructor(
    private readonly platform: Platform
  ) {}
 
  ngAfterViewInit(): void {
    this.platform.ready().then((): void => {this.init()})
  }
 
  async init(): Promise<void> {
 
    const builder: MapBuilder = new MapBuilder();
 
    const camera: GeoCoordinate = <GeoCoordinate>{
      longitude: 47.059819,
      latitude: 7.624037
    };
 
    await builder
      .camera(camera)
      .bind("map")
      .build();
  }
}
```

You should await the `Platform.ready` method when you build a map.

**Supported options**
* Camera
* Marker
