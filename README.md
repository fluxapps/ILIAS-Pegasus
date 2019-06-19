# ILIAS Pegasus

ILIAS Pegasus is an app which is running on Android or iOS and integrate functions
of the ILIAS learn management system. For example viewing courses or personal news.
Furthermore it is possible to make files offline available to read them while offline.

[![Build status](https://dev.azure.com/studer-raimann/ILIAS-Pegasus/_apis/build/status/ILIAS-Pegasus-CI)](https://dev.azure.com/studer-raimann/ILIAS-Pegasus/_build/latest?definitionId=1)

## Getting Started
These instructions will get the ILIAS Pegasus app up and running.

### Prerequisites
The following tools are needed to build and deploy the app.

Ionic CLI:
```bash
npm install -g ionic
```

Cordova CLI:
```bash
npm install -g cordova
```

#### iOS Development
A few additional tools are needed to run the app on an iOS device or emulator.

Install xcode over the apple app store.

Install the development cli tools with 
```bash
xcode-select --install
```

Install ios-sim which is used to fire up the iOS emulator.
```bash
npm install -g ios-sim
```

Install ios-deploy which is used to deploy apps on a device.
```bash
npm install ios-deploy
```

#### Android Development

Install Android Studio from google.
<https://developer.android.com/studio/index.html>

Install the latest Android SDK with the Android Studio Android SDK manager.
Add the root of your Android SDK to the environment variable $ANDROID_HOME.

Install the Java 8 SDK from oracle. Java 9 and 10 are not supported at the moment.
<http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html>
Add the path to your java runtime to the $JAVA_HOME environment variable.

### Install Dependencies
Clone the project to your workspace.
Change into the cloned project and install all dependencies.
This could take several minutes.
```bash
npm install
```

### Configure your ILIAS Installation

Copy and edit the template of s[server.config.json.template](../blob/master/branding/common/config/server.config.json.template)  and add the development ILIAS
installation. 
Save you configurationfile as server.config.json in branding/common/config. 
Add you Installation id to the config.json file in your brand (eg. branding/brands/vanilla/config.json)

### Install Brand
[Choose your brand, following the README.md in the branding folder.](../blob/master/branding/README.md)

### Install Platforms

Install the both platforms.
```bash
ionic cordova prepare
```


### Debug Build

The iOS app can be build with the following command.
```bash
ionic cordova build ios
```

The Android can be build with the same command.
```bash
ionic cordova build android
```

## Run the Tests

### Lint
The linter can be run as shown bellow.
```bash
npm run tslint
```
A lot of old code does not comply with the new code style rules checked by tslint, which 
result in a lot of warnings.

### Unit tests
The unit tests can be run with the command shown bellow.
```bash
npm run karma:singlerun
```

If karma should keep running after the tests use the following command.
```bash
npm run karma
```

## Deployment

### Configuration
Add only the productive ILIAS installations which are ready for production use.

Move the template file if not already done.
```bash
mv src/assets/config.json.template src/assets/config.json
```

**Caution!** Never reuse a installation id, use a new one instead.

### iOS

The iOS app can be build with the following command.
```bash
ionic cordova build ios --release --prod
```

### Android

There is a separate build script `./tools/build-android.sh` which can be
used to build the Android release version. Execute the script in the root of the app
project. Only Linux and macOS are currently supported by the build script.
```bash
./tools/build-android.sh
```

There is a range of environment variables which can be used to run the Android build scripts.
- **ANDROID_BUILD_TOOLS_VERSION** - Set the Android tools version which should be used for example "27.0.3"
- **KEYSTORE_PASSWORD** - The password of the keystore which is used to sign the app, the script will ask for a password if empty.
- **KEY_STORE** - The path to the keystore which should be used to sign the app.
- **OUTPUT_DIR** - The directory which will contain the signed build of the Android app.
- **PROJECT_ROOT** - The project root of the project which should be built, defaults to current working directory.

Example with options.
```bash
ANDROID_BUILD_TOOLS_VERSION="27.0.3" \  
KEY_STORE="mystore.jks" \ 
OUTPUT_DIR="./bin" \ 
./tools/build-android.sh
```

### Troubleshoting
#### Cordova Plugin GoogleMaps
In order to use Learnplaces (Lernorte) you need the google map plugin. Use Version 2.4.6.
If allready installed another version remove the plugin:
```bash
ionic cordova plugin remove cordova-plugin-googlemaps
```
Add it using your API Key:
```bash
ionic cordova plugin add cordova-plugin-googlemaps@2.4.6 \
    --variable API_KEY_FOR_ANDROID="YOUR API KEY ANDROID GOES HERE" \
    --variable API_KEY_FOR_IOS= "YOUR API KEY IOS GOES HERE"
```


### Build With
* [Cordova](https://cordova.apache.org/) - Is powering the app.
* [Ionic](https://ionicframework.com/) - To build a responsive UI.
* [Typescript](https://www.typescriptlang.org/) - Helps maintaining large code bases and catch type issues early.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases on this repository](https://github.com/studer-raimann/ILIAS-Pegasus/releases). 

## Authors

See the list of [contributors](https://github.com/studer-raimann/ILIAS-Pegasus/graphs/contributors) who participated in this project.

## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
We would also like to thank all the authors of the plugins and libraries we used!
Please check the [package.json](package.json) or run the command bellow to see a list of all the plugins and libraries.
```bash
npm la --depth 0
```

### Contact
[info@studer-raimann.ch](mailto://info@studer-raimann.ch)  
<https://studer-raimann.ch> 
