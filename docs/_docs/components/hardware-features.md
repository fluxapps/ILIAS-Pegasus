---
title: Hardware Features
menuHeading: Components
authors:
    - nmaerchy
sections:
    - Usage
    - Callback Action
---

# Hardware Features

Support to check the access to hardware features like wifi or location.

**Features**

* Location access
* Wifi access
* Roaming data service access (Android only)

# Usage

To require hardware features, inject the `Hardware` class.

```typescript
@Component()
export class MyComponent {
 
    constructor(
        private readonly hardware: Hardware
    ) {}
 
    async doStuff(): Promise<void> {
         
        await this.hardware.requireLocation().check()
    }
}
```

The `check` method will throw a `HardwareAccessError` if the required feature is not available.

If you can not do your stuff when a feature is not available and just want to inform the user
that he has to enable it, do not catch this error but let it bubble up the call stack.

ILIAS Pegasus has fallback screens for these features which will automatically used, when the
specific `HardwareAccessError` is thrown.

Because a fallback screen acts as a default error handler, it will only
appear if the `HardwareAccessError` is never caught. Due this limitation, the easiest way
to require hardware features and use the fallback screen is, to require the feature you want
in an Angular `@Component`. There you have the control that the error is never caught or always
re-thrown if you need a try catch for something else.

Learn more about [Fallback Screen]({{ site.baseurl }}{% link _docs/ui/fallback-screen.md %})

# Callback action

When you require a hardware feature and want to invoke a function when the fallback screen 
is closed, you can specify an `onFailure` function.

```typescript
@Component({...})
export class MyComponent {
 
    constructor(
        private readonly hardware: Hardware,
        private readonly nav: NavController
    ) {}
 
    async doStuff(): Promise<void> {
         
        this.hardware.requireLocation()
        .onFailure(() => this.nav.pop())
        .check();
    }
}
```

In this example the user will navigate to the previous page, when he closes the fallback screen.
This can be useful, if you have a `@Component` that can not be used at all, when a certain 
hardware feature is not available.

> Only works when fallback screens are used
