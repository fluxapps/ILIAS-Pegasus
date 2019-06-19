#!/usr/bin/env bash

SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DIFF_NAME="patch.diff"
TYPESCRIPT_PATH="./node_modules/typescript"
TYPESCRIPT_FILE="$(cd $(dirname "$TYPESCRIPT_PATH/lib/typescript.js") && pwd -P)/typescript.js"
VERSION_REQUIRED="2.6.2"

if [[ ! -r "$TYPESCRIPT_PATH" ]]; then
    echo "No typescript installation found, please install your node modules first. (npm i)"
    exit 1
fi

TYPESCRIPT_VERSION=`sed -n 's/.*"version":.*"\(.*\)".*/\1/p' "$TYPESCRIPT_PATH/package.json"`
if [[ "$TYPESCRIPT_VERSION" != "$VERSION_REQUIRED" ]]; then
    echo "Typescript patch requires TS version '$VERSION_REQUIRED' but found '$TYPESCRIPT_VERSION'"
    echo "Typescript version mismatch -> patch not applied!"
    exit 0
fi

echo "Typescript version matches: '$VERSION_REQUIRED'"

echo "Apply patch for nodeCanBeDecorated"
patch "$TYPESCRIPT_FILE" "$SCRIPT_PATH/$DIFF_NAME"
echo "Patch applied"
