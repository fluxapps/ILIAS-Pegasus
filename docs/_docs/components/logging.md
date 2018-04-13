---
title: Logging
menuHeading: Components
sections:
    - Usage
    - Error logs
    - Appender
---

# Logging

ILIAS Pegasus has its own logging implementation. At the moment, this implementation
is not very powerful, but simple to use.

> JS log libraries had to much compatibility problems with Ionic, therefore we implemented an own logging

**Features**

* Multiple log levels
    * TRACE
    * DEBUG
    * INFO
    * WARN
    * ERROR
    * FATAL
* Location Aware
* Timestamp
* Buffered Logging
* Interface for appenders

# Usage

Create a logger by the `getLogger` function of the `Logging` namespace.

```typescript
import {Logging} from "src/services/logging/logging.service";
 
export class MyClass {


    private readonly log: Logger = Logging.getLogger(MyClass.name);
 

    myMethod(): void {
        this.log.info(() => "myMethod is called");
    }
}
```

> The parameter for Logging.getLogger is a string. If you log inside a class, use the MyClass.name property.

# Error logs

Because in Javascript anything can be an `Error`, the `Logging` namespace provides a
function to get the `message` property of an `Error` or a fallback message, if the property is not available.

```typescript
try {
 
 
} catch(error) {
    this.log.warn(() => Logging.getMessage(error, "Fallback message"));
}
```
# Appender

A logger can have n appender. An appender does the actual logging, where it defines to log.

## Abstract appender

**Buffered appender**

A buffered appender has a buffer size and does not log until the size is reached.
If the size of the buffer is full, it will log all messages.

> A buffered appender can be extended to introduce a new appender

**Log level appender**

A log level appender can be configured to only log a certain log level or higher.

**Console appender**

A very simple console logger, which invokes `console.log` of Javascript.
