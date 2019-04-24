#!/bin/sh

echo [ setting branding ]
node ./branding/set_brand.js --brand=$1

echo
echo [ removing platforms ]
ionic cordova platform remove android
ionic cordova platform remove ios

echo
echo [ adding platforms ]
ionic cordova platform add android
ionic cordova platform add ios
