const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// WCU = 1

/* ========================================================================== */
/* Set up: provide put values and condition to do a put only PK does not exist
/* ========================================================================== */

/* provide default values you would like to insert into table  */
var putValues = {
  "userid": "db00004",   "appcode":  "hmc",  "appname":  "Home Maintenance Checklist",
  "assetid":   dbtools.getNewAssetId(),
  "backgroundImage": 'myimageurl17',
  "defaultLoginScreen":  'Dashboard',
  "maxchecklists":  3,
  "locationReminders": false,
  "createDate":  dpbutils.currentDateTimestamp(),
  "updDate":  dpbutils.currentDateTimestamp('9999-01-01')
};


/* Pass in table name and the putValues to DbPutItem constructor */
var db_puter  = new dbtools.DbPutItem("AppSettings", putValues);
db_puter.setNotExistConditionOn("userid");   // set condition such you execute put only
                                            //     if userid/appcode does not exist in table

/* ========================================================================== */
/* Execute PutItem command
/* ========================================================================== */

/* execute Put item database request */
db_puter.executeDbRequest(db_puter.dbParms()).then(function(data) {
    if (dpbutils.loginfo_enabled) {
      dpbutils.loginfo(`'${thisFilename}' Put Item request completed successfully: ${JSON.stringify(db_puter.dbParms(),null,2)}`);
    }
   //  Log DB request has Ended
    dpbutils.loginfo(`'${thisFilename}' Ended`);
}).catch(function(err) {
  // Call errorhandler with err object, the filname, the operationName, and Parms
  console.log("This is err code", err.code);
  dpbutils.errorHandler(err, thisFilename, "PutItem", db_puter.dbParms());
})
