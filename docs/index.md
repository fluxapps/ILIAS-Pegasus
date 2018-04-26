---
landingPage: true
layout: page
title: Getting Started
sections:
    - Introduction
    - name: Setup the environment
      children:
      - Get the code
      - NodeJS
      - Cordova
      - Ionic
      - Android SDK
      - iOS Tools
authors: 
    - nschaefli
---

# Getting Started

## Introduction
The ILIAS Pegasus app provides an easy interface which shows various information of the connected
ILIAS installation.

Files can be downloaded for convenient offline access while traveling. Furthermore learnplaces
can be used to teach in an interactive and engaging way.

This documentation is intended for interested developers which would like to start developing code for the
ILIAS Pegasus app.

## Setup the environment

### Get the code
The code is hosted with love by github and located at <https://github.com/studer-raimann/ILIAS-Pegasus>.
```bash
git clone git@github.com:studer-raimann/ILIAS-Pegasus.git
```

### NodeJS
NodeJS is based on the V8 javascript engine, and is required to run a range 
of cli command introduced later in environment setup chapter.

NodeJS can be downloaded on the official side or over a package manager like brew or apt.
Official side: <https://nodejs.org>

It is recommended to use a recent version to avoid problems with the cli tools.


### Cordova
Cordova provides basic implementations for the Android and iOS platforms.
These basic apps open a webview which displays pegasus web app.

Cordova can be installed via npm.

```bash
npm install -g cordova
```

### Ionic
Ionic is used to create responsive web apps. With a lot of standard widget like toasts.

The ionic cli can be installed via npm as well.
```bash
npm install -g ionic
``` 

### Android SDK
It is generally a good idea to install the android studio to manage the AVD's (Android Virtual Devices)
and Android SDK's.
To install the Android Studio follow the google tutorial located at <https://developer.android.com/studio/install.html>. 

After the Android Studio installation succeeded the SDK has to be installed.
Make sure to download the Cordova Android platform, otherwise no project is available
to open by Android Studio.
Execute the following command to download the Android platform.

```bash
ionic cordova prepare android
```
After the download and installation process is complete the platform is located at `./platforms/android`.

The SDK management dialog is located at Settings -> Appearance & Behaviour -> Android SDK.
Add the API 27 target which is the latest build target for the ILIAS Pegasus app.

Afterwards make sure to add the `$ANDROID_HOME` environment variable which is pointing to your
Android SDK root. The Android tools must be added to the `$PATH` to access the Android tools like adb or the emulator. 
These tools are located at: 
- Android SDK tools `$ANDROID_HOME/platform-tools/`
- Android Emulator `$ANDROID_HOME/emulator/`
- Android platform tools `$ANDROID_HOME/tools/bin/`

For further information see <https://developer.android.com/studio/command-line/index.html>

### iOS Tools
The iOS tools are only usable on a macOS system.

Install the latest xcode.
After the successful installation check the installation:
```bash
xcode-select --print-path
```
The command output should look like this `/Applications/Xcode.app/Contents/Developer`.
If the output is empty or not as shown above use the following command to change the path:

```bash
sudo xcode-select --switch "/Applications/Xcode.app/Contents/Developer"
```

Install the command line tools with:
```bash
sudo xcode-select --install
```


Install the `ios-deploy` package:
```bash
npm install -g ios-deploy
```
iOS deploy can be used to deploy apps onto physical devices.


Install the `ios-sim` package:
```bash
npm install -g ios-sim
```
iOS sim is used to start the iOS emulator with the specified app.


Download the Cordova ios platform:
```bash
ionic cordova prepare ios
```

After the installation finishes without errors open the ios platform in xcode.
The xcode project is located at `./platforms/ios`.
Open xcode and open the platform project. Select the `App` project and configure the
developer certificate, otherwise the app build will fail with a signing error.



