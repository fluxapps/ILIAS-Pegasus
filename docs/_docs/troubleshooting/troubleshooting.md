---
title: Troubleshooting
menuHeading: Troubleshooting
authors:
    - nschaefli
sections:
    - name: Issues
      children:
      - No ILIAS installations selectable
      - Redirect not working after login
      - Blank login page
      - Google maps displays no map
---
# Troubleshooting

## Issues
### No ILIAS installations selectable

#### Issue
No institutions are showing up and no login is possible.

#### Possible Solution
The ILIAS installations are listed in the `config.json` which is located in the assets directory of the app
`./src/assets/`.

Example file content:
```json
{
  "installations": [
    {
      "id": 1,
      "title": "Example University",
      "url": "https://ilias.example.org",
      "clientId": "default",
      "apiKey": "ilias_pegasus",
      "apiSecret": "{API SECRET}",
      "accessTokenTTL": 3600000
    },
    {
      "id": 2,
      "title": "Other University",
      "url": "http://ilias.example.org",
      "clientId": "default",
      "apiKey": "ilias_pegasus",
      "apiSecret": "{API SECRET}",
      "accessTokenTTL": 3600000
    }
  ]
}
```
After recompilation of the app the ILIAS institutions should show up as usual.

### Redirect not working after login
#### Issue
The redirect after a successful login is not working and the in app browser displays the homepage 
of the authenticated user.

#### Possible Solution 1
The PegasusHelper plugin is not active and must be activated to fix the login redirect.
Navigate to the plugin administration and check that the plugin is installed and activated.

#### Possible Solution 2
The client secret is not correct in the `config.json`.
Open the configuration of the PegasusHelper plugin in the plugin administration and
check that the client secret is equal to the content of the client secret in the `./src/assets/config.json`.

### Blank login page

#### Issue
The login page remains blank after several seconds. Therefore no login is possible for the 
selected institution.

#### Possible Solution 1
Check if other institution login pages are showing up.
If all login pages are blank there is likely a problem with the connectivity of the device.

#### Possible Solution 2
The installation url is not valid in the `./src/assets/config.json`
and leads to site not found or timeout errors.

Supply a valid ILIAS installation url and recompile the app to solve the issue.
```json
// ... snip ...
{
  "id": 1,
  "title": "Example University",
  "url": "https://ilias.example.org",
  "clientId": "default",
  "apiKey": "ilias_pegasus",
  "apiSecret": "{API SECRET}",
  "accessTokenTTL": 3600000
}
// ... snip ...
```

### Google maps displays no map
#### Issue
The google maps are showing a gray or no map.

#### Possible Solution
Add valid google map api keys to the `package.json` file.

Example google maps documentation:
```json
// ... snip ...
"cordova-plugin-googlemaps": {
    "API_KEY_FOR_ANDROID": "{YOUR_API_KEY_FOR_ANDROID}",
    "API_KEY_FOR_IOS": "{YOUR_API_KEY_FOR_IOS}"
    
    // ... snip ...
}
// ... snip ...
```

After the configuration of the keys the platform and plugins have to reinstalled in order
to install the keys correctly. The fastest way to do so is to remove the `./platforms` and
`./plugins` folder. Finally execute a Cordova prepare to reinstall the platform and plugins.

```bash
ionic cordova prepare
``` 

After recompiling the app the maps should be displayed as expected.

### iOS emulator not starting after build
#### Issue
The emulator is not starting after a successful iOS debug build.

#### Possible Solution
Install all required iOS development tools as described by the getting started section.
Most likely the `ios-sim` tool is not installed, which is required to start the emulator.



