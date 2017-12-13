var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "AppSettings",
    KeySchema: [
        { AttributeName: "userid", KeyType: "HASH"},  //Partition key
        { AttributeName: "appcode", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "userid", AttributeType: "S" },
        { AttributeName: "appcode", AttributeType: "S" }
        // { AttributeName: "last_checklist_id", AttributeType: "N" },
        // { AttributeName: "location_reminders", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 30,
        WriteCapacityUnits: 30
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
