var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

db_query = new dbtools.DbQuery()
  .setTableName("AppSettings")
  .setIndexName("AppSettingsLsi1")
    // .setPrimaryKey("userid", "db00550")   // This setS KeyCondition Expression and
                                           // and Expression Attribute Values
  .selectItemsWherePrimaryKey("userid").is("=").theValue("db00002")
  .theSortKey("appcode").is("=").theValue("hmc")
  // .theSortKey("SongTitle").matchPattern("begins_with").theValue("Today")
  // .where("price").is("<").theValue("1.00");   // Filter Criteria
   .returnOnly("userid, appcode, defaultLoginScreen, backgroundImage, maxchecklists, locationReminders, assetid");   // projection expression; list of attributes

console.log(JSON.stringify(db_query.dbParms(),null, 2));

// Execute database call
db_query.executeDbRequest(db_query.dbParms()).then(function(data) {
    if (db_query.hasResultSet(data)) {
      dpbutils.loginfo(`'${thisFilename}' Database query completed successfully: Record count = ${data.Count}`);
      if (data.Count === 0) {
        /* logic here when no results */
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    }
    //  Log DB request has Ended
    dpbutils.loginfo(`'${thisFilename}' Ended`);

}).catch(function(err) {
    // Call errorhandler with err object, this filname, the operationName, and Parms
    dpbutils.errorHandler(err, thisFilename, "Query", db_query.dbParms());
})
