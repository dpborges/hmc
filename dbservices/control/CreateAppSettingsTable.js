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
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 30,
        WriteCapacityUnits: 30
    },
    // GlobalSecondaryIndexes: [ // optional (list of GlobalSecondaryIndex)
    // {
    //     IndexName: 'AppSettingsGsi1',
    //     KeySchema: [
    //         { // Required HASH type attribute
    //             AttributeName: 'assetid',
    //             KeyType: 'HASH',
    //         }
    //         // { // Optional RANGE key type for HASH + RANGE secondary indexes
    //         //     AttributeName: 'appcode',
    //         //     KeyType: 'RANGE',
    //         // }
    //     ],
    //     Projection: { // attributes to project into the index
    //         ProjectionType: 'KEYS_ONLY' // (ALL | KEYS_ONLY | INCLUDE)
    //         // NonKeyAttributes: [ // required / allowed only for INCLUDE
    //         //     'attribute_name_1',
    //         //     // ... more attribute names ...
    //         // ],
    //         // ProjectionType: 'KEYS_', // (ALL | KEYS_ONLY | INCLUDE)
    //         // NonKeyAttributes: [ // required / allowed only for INCLUDE
    //         //     'attribute_name_1',
    //         //     // ... more attribute names ...
    //         // ],
    //     },
    //     ProvisionedThroughput: { // throughput to provision to the index
    //         ReadCapacityUnits: 10,
    //         WriteCapacityUnits: 10,
    //     }
    // },
    LocalSecondaryIndexes: [ // optional (list of LocalSecondaryIndex)
        {
            IndexName: 'AppSettingsLsi1',
            KeySchema: [
                { // Required HASH type attribute - must match the table's HASH key attribute name
                    AttributeName: 'userid',
                    KeyType: 'HASH',
                },
                { // alternate RANGE key attribute for the secondary index
                    AttributeName: 'appcode',
                    KeyType: 'RANGE',
                }
            ],
            Projection: { // required
                ProjectionType: 'INCLUDE', // (ALL | KEYS_ONLY | INCLUDE)
                 NonKeyAttributes: [ // required / allowed only for INCLUDE
                    'backgroundImage, defaultLoginScreen, maxchecklists, locationReminders, assetid'
                //     // ... more attribute names ...
                ],
            },
        }
    ]
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
