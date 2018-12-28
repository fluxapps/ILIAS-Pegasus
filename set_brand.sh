#!/bin/bash

# this script sets the appearance of the Pegasus app
# usage: ./set_brand.sh BRAND_NAME COMMAND
# will set the branding to BRAND_NAME and then execute an optional COMMAND

cp src/theme/variables.scss.tpl src/theme/variables.scss
cp src/providers/branding.ts.tpl src/providers/branding.ts

sed -i -e 's/{THEME}/'"$1"'/g' src/theme/variables.scss
sed -i -e 's/{THEME}/'"$1"'/g' src/providers/branding.ts

eval $2
