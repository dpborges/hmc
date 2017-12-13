const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

/* provide values you would like to insert into table  */
var putValues = {
  userid:   "db00450|hmc",
  appcode:  "hmc",
  lastChecklistId: 257,
  locationReminders: true
};

/* Pass in table name and the putValues to DbPutItem constructor */
var db_puter  = new dbtools.DbPutItem("AppSettings", putValues);

var parms = db_puter.dbParms();           // retrieve params from db_puter object
parms.setNotExistConditionOn("userid");   // set condition such you execute put only
                                          //     if userid does not exist in table

/* execute Put item database request */
db_puter.executeDbRequest(parms).then(function(data) {
  if (dpbutils.loginfo_enabled) {
    dpbutils.loginfo(`'${thisFilename}' Put Item request completed successfully: ${JSON.stringify(parms,null,2)}`);
  }

  //  Log DB request has Ended
  dpbutils.loginfo(`'${thisFilename}' Ended`);
}).catch(function(err) {
      dpbutils.logerror(`'${thisFilename}' >>>>>>> Error Encountered <<<<<<<`);
      if (err === "ConditionalCheckFailedException") {
        dpbutils.logerror(`'${thisFilename}' Put Item Failed with 'ConditionalCheckFailedException'`);
        dpbutils.logerror(`'${thisFilename}' Primary already exist in table: ${JSON.stringify(parms, null,2)}`);
      } else {
        dpbutils.logerror(`'${thisFilename}' Input parameters used: ${JSON.stringify(parms, null,2)}`);
        dpbutils.logerror(err, err.stack);
      }
      dpbutils.logerror(`'${thisFilename}' >>>>>>> End of Error text <<<<<<<`);
})
