// this small section is provided by the Espresso Logic server when running in the server.
// a small emulator is provided for testing locally.

out = java.lang.System.out;

var SysUtility = {
    restPost : function restPost(url, params, settings, data) {
        var restCaller = new com.kahuna.logic.lib.rest.RestCaller(this);
        var result = restCaller.post(url, params, settings, data);
        return result;
    },

    restGet : function restGet(url, params, settings) {
        var restCaller = new com.kahuna.logic.lib.rest.RestCaller(this);
        var result = restCaller.get(url, params, settings);
        return result;
    }
};

// load the class
load("StormpathSecurityProvider.js");

// configuration needed for testing
var configSetup = {
    stormpathID : "OUXKJKKW82ZX2IRMTPPBVYDQX",
    stormpathSecret: "F99Sz5llVDM0Y4X7FVSZCgYGTos5rJ2/A5nPLkB476U",
    stormpathLoginID : "5u5PQe9griTl6Ey386yXzz"
};


// this is how the server creates the security object
var stormObject = stormpathSecurityProviderCreate();
stormObject.configure(configSetup);

var payload = {
    username: "David",
    password: "Password$1"
};

out.println("------------- testing authenticate with good payload");
var result = stormObject.authenticate(payload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");


out.println("------------- testing authenticate with bad payload");
badPayload = {
    username: "DavidBAD",
    password: "Password$1"
};

result = stormObject.authenticate(badPayload);
out.println(JSON.stringify(result, null, 2));
out.println("-------------");


out.println("------------- testing getAllGroups");
result = stormObject.getAllGroups();
out.println(JSON.stringify(result, null, 2));
out.println("-------------");

out.println("------------- testing getLoginInfo");
result = stormObject.getLoginInfo();
out.println(JSON.stringify(result, null, 2));
out.println("First field is " + result.fields[0].name);
out.println("-------------");

out.println("------------- testing getConfigInfo");
result = stormObject.getConfigInfo();
out.println(JSON.stringify(result, null, 2));
out.println("First config prop is " + result.fields[0].name);
out.println("-------------");
