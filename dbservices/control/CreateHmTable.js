var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "HMChecklist",
    KeySchema: [
        { AttributeName: "assetid", KeyType: "HASH"}  //Partition key
        // { AttributeName: "appcode", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "assetid", AttributeType: "S" }
        // { AttributeName: "appcode", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 300,
        WriteCapacityUnits: 300
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
