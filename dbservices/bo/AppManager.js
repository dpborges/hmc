//Used-For-AWS const AWS = require('aws-sdk');
const _   = require("lodash");

const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
// const schema   = require("./../dbutils/schema");  // Import table definitions

//Used-For-AWS const dynamodb = new AWS.DynamoDB({region: 'us-east-1', apiVersion: '2012-08-10'});

const platform = "local";

const BoConfig = {
  category:         "Applications Management",
  appcode:          "apm",
  datadomain:       "Application User Settings",
  apmTable:         "AppSettings"
}

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log message that execution has started
dpbutils.loginfo(`'${thisFilename}.createSettings' Started`);

/* ========================================================================== */
/* Checklist Constructor
/* ========================================================================== */
function AppManager (userid) {
  this.userid   = userid;
  this.appname  = "";
  this.appcode  = BoConfig.appcode;
  this.defaultLoginScreen = "";
  this.backgroundImage = "";
  this.maxChecklists = 3;
  this.locationReminders = false,
  this.assetid =  "";
  this.datadomain   = BoConfig.datadomain;
  this.category = BoConfig.category;
  this.createDate         = "";
  this.updDate            = "";

  this.clipboard   = {};
};

AppManager.prototype = {

  createSettings: function createSettings(appName) {
    var self = this;
    this.appname = appName;
    return new Promise (function resolver(resolve, reject) {
        var queryParm;
        if (platform === "aws") {
              var stringObj1 = {S: self.userid};
              var stringObj2 = {S: self.appname};
              var db_query = new dbtools.DbQuery()
              .setTableName(BoConfig.apmTable)
              .selectItemsWherePrimaryKey("userid").is("=").theValue(stringObj1)
              // .selectItemsWherePrimaryKey("userid").is("=").theValue('{S: "' + self.userid + '"}')
              .theSortKey("appname").is("=").theValue(stringObj2)
              .returnOnly("userid, appcode, appname, defaultLoginScreen, backgroundImage, maxchecklists");   // projection expression; list of attributes
              console.log(JSON.stringify(db_query.dbParms(),null, 2));
        } else {
              var db_query = new dbtools.DbQuery()
              .setTableName(BoConfig.apmTable)
              .selectItemsWherePrimaryKey("userid").is("=").theValue(self.userid)
              .theSortKey("appname").is("=").theValue(appName)
              .returnOnly("userid, appcode, appname, defaultLoginScreen, backgroundImage, maxchecklists");   // projection expression; list of attributes
              console.log(JSON.stringify(db_query.dbParms(),null, 2));
        }
        // Execute database query to check if record exists
        db_query.executeDbRequest().then(function(data) {
            if (db_query.hasResultSet(data) && data.Count > 0) {
                return Promise.resolve(`DuplicateRecord: userid:${self.userid}|appname:${self.appname} in AppSettingsTable`);
                // console.log(JSON.stringify(data, null, 2));
            } else {
                if (platform === "aws") {
                  var putValues = {
                    "userid": {"S": self.userid},    "appname":  {"S": self.appname},
                    "backgroundImage": {"S": 'db05imageURL'},
                    "defaultLoginScreen":  {"S": 'Dashboard'},
                    "maxchecklists":  {"N": "3"},
                    "locationReminders": {"BOOL": false},
                    "assetid":    {"S": dbtools.getNewAssetId()},
                    "appcode":    {"S": BoConfig.appcode},
                    "createDate": {"S": dpbutils.currentDateTimestamp()},
                    "updDate":    {"S": dpbutils.currentDateTimestamp('9999-09-09')}
                  }
                } else {
                  var putValues = {
                    "userid": self.userid,    "appname": self.appname,
                    "backgroundImage": 'db05imageURL',
                    "defaultLoginScreen":  'Dashboard',
                    "maxchecklists":   3,
                    "locationReminders": false,
                    "assetid":    dbtools.getNewAssetId(),
                    "appcode":    BoConfig.appcode,
                    "createDate": dpbutils.currentDateTimestamp(),
                    "updDate":    dpbutils.currentDateTimestamp('9999-09-09')
                  }
                }
                var db_puter  = new dbtools.DbPutItem(BoConfig.apmTable, putValues);
                queryParm = db_puter.dbParms();  // Save query parm, if you would like to reference in then callback
                // console.log(JSON.stringify(queryParm, null, 2));
                return db_puter.executeDbRequest();
           }
        }).then
           (function(data) {
              if (_.isEmpty(data)) {
                dpbutils.loginfo(`'${thisFilename}.createSettings' completed successfully`);
                resolve("success");
              }
              else {
                resolve(data)
              }
           },
          function (err) {
              var stackTrace = err.stack || "";
              dpbutils.logerror(`'${thisFilename}.createSettings' ${err.name} ${err.message} ${stackTrace}`);
        }) // end of executeDbRequest
     }); // end of promise
    } // end of createSettings

} // end of AppManager Prototype


module.exports = {
  AppManager
}
