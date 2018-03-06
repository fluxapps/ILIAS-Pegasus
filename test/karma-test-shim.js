/*
 * Defines all modules or files that should be loaded into the browser.
 * Is needed to load dependencies that AngularJS needs as well as our own spec files.
 */

import {useStandard} from "../src/standard";
import {isUndefined} from "ionic-angular/es2015/util/util";

// load standard.ts to enable its global declarations
useStandard();

Error.stackTraceLimit = Infinity;

require('core-js/es6');
require('core-js/es7/reflect');
require('rxjs');

require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require("zone.js/dist/mocha-patch");

const encoding = require("text-encoding");
if(isUndefined(window.TextDecoder))
  window.TextDecoder = encoding.TextDecoder;

if(isUndefined(window.TextEncoder))
  window.TextEncoder = encoding.TextEncoder;


// configure chai
let chai = require("chai");
/*
 * User configurable property, sets length threshold for actual and expected values in assertion errors.
 * If this threshold is exceeded, the value is truncated.
 */
chai.config.truncateThreshold = 120;


// load our spec files
let appContext = require.context('../test', true, /\.spec\.ts/);
appContext.keys().forEach(appContext);
