const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

var queryParm;

/* ========================================================================== */
/* Set up: provide put values and condition to do a put only PK does not exist
/* ========================================================================== */
db_query = new dbtools.DbQuery()
  .setTableName("AppSettings")
    // .setPrimaryKey("userid", "db00550")   // This setS KeyCondition Expression and
                                           // and Expression Attribute Values
  .selectItemsWherePrimaryKey("userid").is("=").theValue("db00005")
  .theSortKey("appcode").is("=").theValue("hmc")
    // .theSortKey("SongTitle").matchPattern("begins_with").theValue("Today")
  .where("appname").is("=").theValue("Home Maintenance Checklist")   // Filter Criteria
  .returnOnly("userid, appcode, appname, defaultLoginScreen, backgroundImage, maxchecklists");   // projection expression; list of attributes

// Execute database query to check if record exists
db_query.executeDbRequest().then(function(data) {
    var recordExists = false;
    if (db_query.hasResultSet(data)) {
      dpbutils.loginfo(`'${thisFilename}' Database query completed successfully: Record count = ${data.Count}`);
      if (data.Count > 0) {
        recordExists = true;
        console.log(JSON.stringify(data, null, 2));
      }
    }
    if (!recordExists) {     // Insert record
       /* provide default values you would like to insert into table  */
       var putValues = {
         "userid": "db00005",   "appcode":  "hmc",  "appname":  "Home Maintenance Checklist",
         "assetid":   dbtools.getNewAssetId(),
         "backgroundImage": 'db05imageURL',
         "defaultLoginScreen":  'Dashboard',
         "maxchecklists":  3,
         "locationReminders": false,
         "createDate":  dpbutils.currentDateTimestamp(),
         "updDate":  dpbutils.currentDateTimestamp('9999-01-01')
       };

       var db_puter  = new dbtools.DbPutItem("AppSettings", putValues);
       queryParm = db_puter.dbParms();  // Save query parm
       return db_puter.executeDbRequest();

    } else {  // Record already exist
      return Promise.resolve("Data Exists");
    }
    //  Log DB request has Ended

}).then(function(data) {
    if (data === "Data Exists") {
       dpbutils.loginfo(`'${thisFilename}' Put statement ignored; Data in query parameter already exists`);
    } else {
      dpbutils.loginfo(`'${thisFilename}' Put statement completed successfully.${JSON.stringify(queryParm,null,2)}`);
    }

   //  Log DB request has Ended
    dpbutils.loginfo(`'${thisFilename}' Ended`);
}).catch(function(err) {
    // Call errorhandler with err object, this filname, the operationName, and Parms
    dpbutils.errorHandler(err, thisFilename, "Query", db_query.dbParms());
});
