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
          "appname":              "",
          "assetid":              "",
          "backgroundImage":      "",
          "defaultLoginScreen":   "",
          "maxchecklists":        "",
          "locationReminders":    false,
          "createDate":           "",
          "updDate":              ""
        }
    },
    HMChecklist: {
        TableName:              "HMChecklist",
        Item: {
          "assetid":              "",
          "userid":               "",
          "chklistname":          "",
          "appcode":              "",
          "datadomain":           "",
          "chklistnameplus":      "",
        }
    }
}; /* end of tabledef */




module.exports = {
  tabledef
}
