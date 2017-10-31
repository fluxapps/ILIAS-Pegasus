/*
 * Defines all modules or files that should be loaded into the browser.
 * Is needed to load dependencies that AngularJS needs as well as our own spec files.
 */

Error.stackTraceLimit = Infinity;

require('core-js/es6');
require('core-js/es7/reflect');

// zone.js is needed by AngularJS
require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');

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
