---
title: Fallback screen
menuHeading: UI
authors:
    - nmaerchy
sections:
    - Fallback screen and hardware features
---

# Fallback screen and hardware features

Fallback screens are popup-like overlays which will be shown, if ILIAS Pegasus
don't have access to a feature it requires, like the location.

A fallback screen will be shown automatically when [Hardware Features]({{ site.url }}/docs/components/hardware-features) are used.

```typescript
@Component({...})
export class MyComponent {
 
    constructor(
        private readonly hardware: Hardware
    ) {}
 
    async doStuff(): Promise<void> {
         
        await this.hardware.requireLocation().check()
    }
}
```

This will show the fallback screen for the location, if ILIAS Pegasus does not have
access to the location service.
