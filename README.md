## Install IONIC2
```
$ sudo npm install -g ionic cordova
```
In case you get an error like this: `Caught exception: Error: Cannot find module 'inherits'`, which *can* occur if you previously installed the beta version of ionic2, execute the following commands:
```
sudo npm uninstall -g ionic cordova
sudo npm install -g ionic cordova
```
## Install Dependencies
```
$ npm install
```

### iOS-Deployment needs
```
sudo npm install -g ios-sim
sudo npm install -g ios-deploy
```
## Generate Configuration File
Copy and edit the template of config.json
```
cp src/assets/config.json.template src/assets/config.json
nano src/assets/config.json
```

## Prepare Development
```
$ ionic state reset
```
will install all platforms and plugins needed

