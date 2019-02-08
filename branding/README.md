this directory contains the data that is customizable for the different brands of the pegasus-app

# usage

each brand is defined by a directory 'brands/[BRAND_NAME]'

in order to apply the customization to the app, use the following command

    ionic cordova CMD -- --theme=[BRAND_NAME]

with CMD = 'prepare ...', 'build ...', 'run ...' or 'emulate ...'

this will prepare the app, where the hook-script './branding/set_brand.js' will set the customization and generate a log-file at './branding/set_brand.log'

# structure for each brand

the following structure of directories and files must be provided for each brand

* [BRAND_NAME]
* [BRAND_NAME]/assets
* [BRAND_NAME]/assets/stylesheets/theme.scss
* [BRAND_NAME]/resources
* [BRAND_NAME]/config.json

# config

the file '[BRAND_NAME]/config.json' contains information that is used by the hook-script './branding/set_brand.js'

__template__

```
{
  "ilias_installation_ids": []
}
```

the array 'ilias_installation_ids' contains ids that correspond to ILIAS-installations, declared in './branding/common/config/server.config.json'

only the chosen entries will be available on the login-screen in the customized app, and the first id sets the default installation for the login

# languages

the basis all brands is set in './branding/common/i18n'

if brand-specific translations are needed, they can be defined in '[BRAND_NAME]/assets/i18n', where a file with the same name as the one that should be modified must be placed

__example usage__
* './branding/common/i18n/en.json'

```
{
  "0" : "apple",
  "1" : {
    "2" : "juice"
  }
}
```

* '[BRAND_NAME]/assets/i18n/en.json'

```
{
  "1" : {
    "2" : "pie"
  },
  "3" : "new"
}
```

* resulting './assets/i18n/en.json'

```
{
  "0" : "apple",
  1" : {
    "2" : "pie"
  },
  "3" : "new"
}
```

# stylesheets and fonts

the file '[BRAND_NAME]/assets/stylesheets/theme.scss' is the only scss-file that will be imported by the app, it thus is responsible for all the styling

in addition, the variable '$ionicons-font-path' will be set to match the content of '[BRAND_NAME]/assets/fonts'

# icons and images

the directories '[BRAND_NAME]/assets/icon' and '[BRAND_NAME]/assets/img' must contain the concerned assets that are used by the app

# resources

the directory '[BRAND_NAME]/resources' contains the splash screens and icons for android and ios, it will be placed at './resources'
