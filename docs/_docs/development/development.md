---
title: Development
menuHeading: Development
authors:
    - nschaefli
sections:
    - name: Debugging
      children:
      - iOS Emulator
      - Android Emulator
      - iOS Device
      - Android Device
    - name: Emulate & Run
      children:
      - Run Android
      - Run iOS
      - Emulate Android
      - Emulate iOS
      - Live Reload
      - Display Logs
---
# Development
The aim of the development section is to show how the app can be run in a development environment
as well as some basic debug techniques.
 
## Debugging


### iOS Emulator
The web view of the iOS app can be debugged via safari.

- Enable the Develop menu in the Safari settings. 
  Safari -> Preferences -> Advanced -> tick option "Show Develop menu in menu bar"
- Start the iOS emulator.
- Attach Safari to the app in the Develop menu.

#### Caveats
The iOS emulator seems to use the entire RAM pool of the machine it runs on, therefore
memory issues are likely never appearing while emulating but while running on a device.

### Android Emulator

#### Web View
The web view of the Android app can be debugged with google chrome.

- Navigate to <chrome://inspect/#devices>
- Attach to Pegasus App


#### Native Logs
Logs of the cordova plugins are sometimes really helpful to debug problems which are not reaching
the web view at all or in a rather strange way.

- Make sure adb is on the path
- Execute "adb logcat"

There are a lot of filter options to get the desired log output. 
For a list of available filters see <https://developer.android.com/studio/command-line/logcat.html>

### iOS Device
Before Safari can be attached to device as described in the chapter [iOS Emulator](#ios-emulator)
the option has to be activated in the iPhone settings.
The web inspector is located at: 

`Settings -> Safari -> Advanced -> Web Inspector`

With activated web inspector, the procedure is the same as described in [iOS Emulator](#ios-emulator).

### Android Device
There are no special preparations necessary to debug the web view on android with chrome.
Please refer to [Android Emulator](#android-emulator) for further instructions.

## Emulate & Run

### Run Android
Run the following command to deploy a debug build to the connected Android phone. 
```bash
ionic cordova run --device android
```
### Run iOS
Run the following command to deploy a debug build to the connected iPhone.
```bash
ionic cordova run --device ios
```

The platform must be installed as well as configured with valid development certificates.

### Emulate Android
Create a new virtual device with a recent android image version. It is important to pick a recent 
image because the self updating web view is not updating unless its an emulator image with google 
play support. A standard web view without updates wont support all features required by the app 
and will just display a white screen. 

Run the following command to build a debug build of the app and 
deploy it to the emulated android device.

````bash
ionic cordova emulate android --target="YOUR_DEVICE_NAME"
````

#### Create new Virtual Device
Open the folder "ILIAS-Pegasus/platforms/android" in android studio.
Create a new virtual device in Android Studio "tools -> Android -> AVD Manager".

The device name can be displayed by clicking the Actions drop down and select View Details.
The name displayed next to the name label can be used as target name described in the chapter [Emulate Android](#emulate-android)
  
### Emulate iOS 
The iOS emulators are already preconfigured and can be run without further configuration.
Run the following command to build and deploy a debug version of the app.

```bash
ionic cordova emulate ios --target="iPhone-8"
```  

### Live Reload
Ionic supports live reloading of the web page, this is especially useful while developing the 
user interface. To enable the live reload append the option `-l` or `--livereload` to the
build commands described in the chapters above.


### Display Logs
Ionic is able to record logs and send them to the console where the standard output of the running ionic
command. To enable it add `-cs` to the commands described above. This options are useable with the option
 described in the chapter [Live Reload](#live-reload).
 
 However it's not able to chapter all logs, for example [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS?redirectlocale=en-US&redirectslug=HTTP_access_control) issues which are logged by the web
 view it self are not logged. It is generally a good idea to attach the browser to the web view
 to get all logs and not to relay on the ionic log output.
