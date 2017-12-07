var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    "TableName": "AppSettings",
};

dynamodb.describeTable(params, function(err, data) {
    if (err) {
        console.error(err, err.stack);
    } else {
        console.log(data);
    }
});
