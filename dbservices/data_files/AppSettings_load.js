var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing Appsettings into DynamoDB. Please wait.");

var allSettings = JSON.parse(fs.readFileSync('AppSettings_data.json', 'utf8'));
allSettings.forEach(function(item) {
    var params = {
        TableName: "AppSettings",
        Item: {
            "userid":         item.userid,
            "appcode":        item.appcode,
            "appSettings":    item.appSetting
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add appSettings for user", item.userid, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded for user:", item.userid);
       }
    });
});
