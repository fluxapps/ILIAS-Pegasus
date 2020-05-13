# ILIAS Pegasus

ILIAS Pegasus is an app which is running on Android or iOS and integrate functions
of the ILIAS learn management system. For example viewing courses or personal news.
It's main focus is to make files offline available to read them while offline. Check https://ilias-pegasus.de for more information.

[![Build status](https://dev.azure.com/studer-raimann/ILIAS-Pegasus/_apis/build/status/ILIAS-Pegasus-CI)](https://dev.azure.com/studer-raimann/ILIAS-Pegasus/_build/latest?definitionId=1)

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
In order to use the App your ILIAS needs to be configured first. You need 2 Plugins (also Open Source) to make your ILIAS ready for the Pegasus App:

Follow the instructions here: https://github.com/studer-raimann/PegasusHelper

The following tools are needed to build and deploy the app. 

Ionic CLI:
```bash
npm install -g ionic
```

Cordova CLI:
```bash
npm install -g cordova
```

Xcode:
Install xcode over the apple app store.

Android Studio:
Install Android Studio from google.
<https://developer.android.com/studio/index.html>


#### iOS Development
A few additional tools are needed to run the app on an iOS device or emulator.


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

Install the Java SDK from oracle. 

### Clone the project
Clone the project to your workspace.

```bash
git clone https://github.com/studer-raimann/ILIAS-Pegasus.git
cd ILIAS-Pegasus
```
### Install Dependencies
Change into the cloned project and install all dependencies.
This could take several minutes.
```bash
npm install
```

### Configure your ILIAS Installation

Copy and edit the template of [server.config.json.template](../blob/master/branding/common/config/server.config.json.template)  and add the parameters for your  ILIAS
installation. 
Save you configurationfile as server.config.json in branding/common/config. 

Add you Installation id to the config.json file in your brand (eg. branding/brands/vanilla/config.json).

### Install Brand
```bash
npm run setbrand -- --brand="vanilla"
```
or

[Choose your brand, following the README.md in the branding folder.](../blob/master/branding/README.md)

### Install Platforms

Install the both platforms.
```bash
npx ionic cordova prepare
```


### Debug Build

The iOS app can be build with the following command.
```bash
npx ionic cordova build ios
```

The Android can be build with the same command.
```bash
npx ionic cordova build android
```

### Run in Simulator/Emulator (with livereload and console output)

The iOS app can be build with the following command.
```bash
npx ionic cordova emulate ios -lcs
```

The Android can be build with the same command.
```bash
npx ionic cordova emulate android -lcs
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


### iOS

The iOS app can be build with the following command.
```bash
npx ionic cordova build ios  --prod
```
Open your Xcode Workspace (the YourAppName.xcworkspace in ILIAS-Pegasus/Platforms/ios) and set Certifacates, your Team ID and Release it to the AppStore.

Check here for information about Certificates: https://developer.apple.com/support/certificates/

And Check the ionic docs: https://ionicframework.com/docs/deployment/app-store

As soon as you have all your profiles create an Archive in Xcode -> Product -> Archive and upload it to the Appstore.



### Android

```bash
npx ionic cordova build android --prod --release
```

Create a key, sign your application and upload it following the ionic guide: https://ionicframework.com/docs/deployment/play-store

<!-- ### Troubleshoting -->



### Build With
* [Cordova](https://cordova.apache.org/) - Is powering the app.
* [Ionic](https://ionicframework.com/) - To build a responsive UI.
* [Typescript](https://www.typescriptlang.org/) - Helps maintaining large code bases and catch type issues early.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases on this repository](https://github.com/studer-raimann/ILIAS-Pegasus/releases). 

## Authors
This is an OpenSource project by studer + raimann ag, (https://studer-raimann.ch)
See the list of [contributors](https://github.com/studer-raimann/ILIAS-Pegasus/graphs/contributors) who participated in this project.

### Contact
[info@studer-raimann.ch](mailto://info@studer-raimann.ch)  
<https://studer-raimann.ch> 

[support@ilias-pegasus.de](mailto://support@ilias-pegasus.de)  
<https://ilias-pegasus.de> 

## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
We would also like to thank all the authors of the plugins and libraries we used!
Please check the [package.json](package.json) or run the command bellow to see a list of all the plugins and libraries.
```bash
npm la --depth 0
```


## ILIAS Plugin SLA 

We love and live the philosophy of Open Source Software! Most of our developments, which we develop on behalf of customers or on our own account, are publicly available free of charge to all interested parties at https://github.com/studer-raimann.

Do you use one of our plugins professionally? Secure the timely availability of this plugin for the upcoming ILIAS versions via SLA. Please inform yourself under https://studer-raimann.ch/produkte/ilias-plugins/plugin-sla.

Please note that we only guarantee support and release maintenance for institutions that sign a SLA.
