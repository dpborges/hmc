var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "AppSettings",
    ProjectionExpression: "userid, appcode, appname, assetid,  backgroundImage, defaultLoginScreen, maxchecklists, locationReminders, createDate, updDate",
    // ProjectionExpression: "userid, app_code, last_checklist_id, location_reminders",
    /* ProjectionExpression: "#yr, title, info.rating",
    FilterExpression: "#yr between :start_yr and :end_yr",
    ExpressionAttributeNames: {
        "#yr": "year",
    },
    ExpressionAttributeValues: {
         ":start_yr": 1950,
         ":end_yr": 1959
    }
    */
};

console.log("Scanning AppSettings table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the movies
        console.log("Scan succeeded.");
        console.log("=============================================");
        data.Items.forEach(function(as) {
           console.log(
                "userid: " + as.userid + " ",
                "appcode: " + as.appcode + " ",
                "appname: " + as.appname + " ",
                "assetid: " + as.assetid + "\n",
                "backgroundImage: " + as.backgroundImage + " ",
                "defaultLoginScreen: " + as.defaultLoginScreen  + " ",
                "locationReminders: " +  as.locationReminders + "\n",
                "createDate: " + as.createDate + " ",
                "updDate: " + as.updDate + " ");
          console.log("=============================================");
        });

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
    }
}
