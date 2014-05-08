StormpathAuthProvider
=====================

Espresso Logic Stormpath JavaScript authprovider
Copyright &copy; 2014 Espresso Logic, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).

For additional information, please see the [Espresso Logic API Documentation](https://sites.google.com/a/espressologic.com/site/docs/logic-designer/security/authentication#TOC-Custom-Authentication-Provider).

### Build Instructions ###
This project requires Maven 3.0.3 to build.  Run the following:

`> mvn install`

## Quickstart

StormpathSecurityProvider.js

The Javascript has 5 functions that are required for the interface to work correctly.  The confgure method passes in the JSON settings used by Stormpath.  The authenticate returns the validated user and groups.  The loginInfo and configInfo

load("StormpathSecurityProvider.js");
var stormObject = stormpathSecurityProviderCreate();
stormObject.configure(configSetup);
stormObject.authenticate(payload);  // returns validated user and groups
stormObject.getAllGroups();    // returns ALL groups for this account
stormObject.getLoginInfo();   //returns properties used to generate a logon dialog
stormObject.getConfigInfo(); // returns existing settings


see test.js  (make sure you configure your Stormpath API Key, Secret, and Login Application)


var configSetup = {
    stormpathID : "sotmrpath.id",
    stormpathSecret: "stormpath.secret",
    stormpathLoginID : "stormpath.applicationID",
    keyLifetimeMinutes : 60
};

var payload = {
     	username: ‘MyNewUser’,
     	password: 'Password$1'
};



Send us an email to support@espressologi.com or open up a Pull Request and offer suggestions!

## testing

```bash
test.sh
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
