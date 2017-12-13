// var AWS = require("aws-sdk");
// var fs = require('fs');
//
// AWS.config.update({
//     region: "us-west-2",
//     endpoint: "http://localhost:8000"
// });

var tabledef =
{
    AppSettings: {
        TableName:  "AppSettings",
        Item: {
          "userid":               "",
          "appcode":              "",
          "lastChecklistId":      0,
          "locationReminders":    false
        }
    },
    table2: {
        TableName:              "table2",
        Item: {
          "userid":               { S: "userid_value" },
          "field1":               { S: "app_code_value" },
          "field2":               { S: "app_code_value" }
        }
    }
}; /* end of tabledef */




module.exports = {
  tabledef
}
