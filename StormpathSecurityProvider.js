function stormpathSecurityProviderCreate() {

    var STORMPATH_BASE_URL = 'https://api.stormpath.com/v1/';
    var result = {};
    var configSetup = {
        stormpathID : "",
        stormpathSecret: "",
        stormpathLoginID : "",
        keyLifetimeMinutes : 60
    };

    result.configure = function configure(myConfig) {
        configSetup.stormpathID = myConfig.stormpathID || "";
        configSetup.stormpathSecret = myConfig.stormpathSecret || "";
        configSetup.stormpathLoginID = myConfig.stormpathLoginID || "";
        configSetup.keyLifetimeMinutes = myConfig.keyLifetimeMinutes || 60;
    };

    var encodeBase64 =  function encodeBase64(input) {
        var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var output = "", a, b, c, d, e, f, g, i = 0;

        while (i < input.length) {
            a = input.charCodeAt(i++);
            b = input.charCodeAt(i++);
            c = input.charCodeAt(i++);
            d = a >> 2;
            e = ((a & 3) << 4) | (b >> 4);
            f = ((b & 15) << 2) | (c >> 6);
            g = c & 63;

            if (isNaN(b)) f = g = 64;
            else if (isNaN(c)) g = 64;

            output += map.charAt(d) + map.charAt(e) + map.charAt(f) + map.charAt(g);
        }

         return output;
    };

    var createSettings = function () {
        var auth = 'Basic ' + encodeBase64(configSetup.stormpathID + ':' + configSetup.stormpathSecret);
        var params = null;
        var settings = {
             headers: { 'Authorization' : auth }
        };
        return settings;
    };

    // FUNCTION AUTHENTICATE REQUIRES PAYLOAD {username : '', password : ''}
    result.authenticate = function authenticate(payload) {
        var RESERVED_FIELDS_HREF =  [ 'href', 'createdAt', 'modifiedAt'];

        var parseCustomData =  function parseCustomData(result, stringHREF) {
            for (var id in stringHREF) {
                if (!stringHREF.hasOwnProperty(id)) {
                    continue;
                }
                if (RESERVED_FIELDS_HREF.indexOf(id) != -1) {
                    continue;
                }
                if (stringHREF.hasOwnProperty('customData')) {
                    var customdata = stringHREF[id];
                    for (var key in customdata) {
                        result[key] = customdata[key];
                    }
                }
            }
        };

        var roles = [];
        var errorMsg = null;
        var resetPasswordURL = null;
        var forgotPasswordURL = null;
        var customDataHREF = {};
        var params = null;
        var settings = createSettings();

        var loginAttemptURL = STORMPATH_BASE_URL + 'applications/' + configSetup.stormpathLoginID + '/loginAttempts';

        var basicAuth = encodeBase64(payload.username + ':' +payload.password);
        var data = {type : "basic", value : '"' + basicAuth + '"' };

        try {
            var loginAttempt = SysUtility.restPost(loginAttemptURL, params, settings, data);

            var accountJSON = JSON.parse(loginAttempt);
            if (accountJSON.hasOwnProperty('status')) {
                 errorMsg = "Stormpath: " + accountJSON.developerMessage;
            }
            else {
                var accountURL = accountJSON.account.href + '?expand=customData';
                var accountHREF = SysUtility.restGet(accountURL, params, settings);
                var account = JSON.parse(accountHREF);
                // only check find roles for Enabled Accounts
                if ('ENABLED' === account.status) {
                    resetPasswordURL = account.emailVerificationToken.href;
                    parseCustomData(customDataHREF, account.customData);
                    var groupsURL = account.href+'/groups?expand=customData';

                    var responseGroups = SysUtility.restGet(groupsURL, params, settings);
                    var groups = JSON.parse(responseGroups);
                    for (var i = 0; i < groups.items.length; i++) {
                        if('ENABLED' === groups.items[i].status) {
                            roles.push(groups.items[i].name);
                            var customdata = groups.items[i].customData;
                            parseCustomData(customDataHREF, customdata);
                        }
                    }
                }
            }
        }
        catch (e) {
                errorMsg = e.message;
        }

        var autResponse = {
            errorMessage: errorMsg,
            roleNames: roles,
            userIdentifier: payload.username,
            keyExpiration: new Date(+new Date() + (+configSetup.keyLifetimeMinutes) * 60 * 1000),
            resetPasswordURL: resetPasswordURL,
            forgotPasswordURL: forgotPasswordURL,
            userData: customDataHREF,
            lastLogin : {
                datetime: null,
                ipAddress : null
            }
        };
        return autResponse;
    };

    result.getAllGroups = function getAllGroups() {
        var roles = [];
        var errorMsg = null;
        var groupsURL = STORMPATH_BASE_URL + 'applications/' + configSetup.stormpathLoginID + '/groups';
        var params = null;
        var settings = createSettings();

        try {
            var groupsResponse = SysUtility.restGet(groupsURL, params, settings);
            var groups = JSON.parse(groupsResponse);

            for (var i = 0; i < groups.items.length; i++) {
                if ('ENABLED' === groups.items[i].status) {
                    roles.push(groups.items[i].name);
                }
            }
        }
        catch(e) {
            errorMsg = e.message;
        }

        var autResponse = {
            errorMessage: errorMsg,
            roleNames: roles
        };

        return autResponse;
    };

    result.getLoginInfo = function getLoginInfo() {
        return {
            fields: [
                {
                    name: "username",
                    display: "Username",
                    description: "Enter your Username",
                    type: "text",
                    length: 40,
                    helpURL: "http://docs.stormpath.com/java/quickstart/#authenticate-an-account"
                },
                {
                    name: "password",
                    display: "Password",
                    description: "Enter your Password",
                    type: "password",
                    length: 40,
                    helpURL: "http://docs.stormpath.com/java/quickstart/#authenticate-an-account"
                }
            ],
            links : [
                {
                    display: "Forgot password?",
                    href: "https://api.stormpath.com/forgotLogin"
                },
                {
                    display: "Forgot Tenant?",
                    href: "https://api.stormpath.com/forgotTenant"
                }
            ]
        };
    };

    result.getConfigInfo = function getConfigInfo() {
        return {
            current : {
                "stormpathID" : configSetup.stormpathID,
                "stormpathSecret" : configSetup.stormpathSecret,
                "stormpathLoginID" : configSetup.stormpathLoginID,
                "keyLifetimeMinutes" : configSetup.keyLifetimeMinutes
            },
            fields : [
                {
                    name: "stormpathID",
                    display: "ApiKey ID",
                    type: "text",
                    length: 40,
                    helpURL: "http://docs.stormpath.com/java/quickstart/#-get-an-api-key"
                },
                {
                    name: "stormpathSecret",
                    display: "ApiKey Secret",
                    type: "text",
                    length: 40,
                    helpURL: "http://docs.stormpath.com/java/quickstart/#-get-an-api-key"
                },
                {
                    name: "stormpathLoginID",
                    display: "StormPath ApplicationID",
                    type: "text",
                    length: 40,
                    helpURL: "http://docs.stormpath.com/java/quickstart/#register-your-application-with-stormpath"
                },
                {
                    name: "keyLifetimeMinutes",
                    display: "API Key Lifetime (Minutes)",
                    type: "number",
                    length: 8,
                    helpURL: "http://www.espressologic.com"
                }
            ],
            links: []
        };
    };

    return result;
}
