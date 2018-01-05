var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "HMChecklist",
    AttributeDefinitions: [
        { AttributeName: "userid", AttributeType: "S" },
        { AttributeName: "chklistname", AttributeType: "S" }
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                  IndexName: "HMUseridNameIndex",
                  KeySchema: [
                    {Attributename: "userid", KeyType: "HASH"},
                    {Attributename: "chklistname", KeyType: "RANGE"}
                  ],
                  Projection: {
                    "ProjectionType": "ALL"
                  },
                  ProvisionedThroughput: {
                    "ReadCapacityUnits": 300,
                    "WriteCapacityUnits": 300
                  }
           } /* end Create */
        } /*End GSI object */
    ] /* end of GSI array */
}; /* end of params  */

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to Create GlobalSecondaryIndex. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GlobalSecondaryIndex create successfully. GSI description JSON:", JSON.stringify(data, null, 2));
    }
});
