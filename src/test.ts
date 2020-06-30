// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// tslint:disable-next-line:no-import-side-effect
import "zone.js/dist/zone-testing";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from "@angular/platform-browser-dynamic/testing";
import {useStandard} from "./standard";

// tslint:disable-next-line:no-any
declare const require: any;

// Inject object methods.
useStandard();

Error.stackTraceLimit = Infinity;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Then we find all the tests.
// tslint:disable-next-line:no-any
const context: any = require.context("./", true, /\.spec\.ts$/);

// And load the modules.
context.keys().map(context);
