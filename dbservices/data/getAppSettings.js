var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// Set up parameters to get an item
db_getter = new dbtools.DbGetItem()
    .setTableName("AppSettings")
    .setPrimaryKey("userid", "db00001")
    .setSortKey("appcode","hmc")
    .returnOnly("userid, appcode, lastChecklistId, locationReminders"); // projection expression

// Execute database call
db_getter.executeDbRequest(db_getter.dbParms()).then(function(data) {
    // throw Error("get failed");
    if (db_getter.hasResultSet(data)) {
      console.log(JSON.stringify(data.Item, null, 2));
    } else {
      dpbutils.loginfo(`'${thisFilename}' Resultset empty for following input parameters: `);
      console.log(JSON.stringify(db_getter.dbParms(), null, 2));
    }

    //  Log DB request has Ended
    dpbutils.loginfo(`'${thisFilename}' Ended`);

}).catch(function(err) {
    // Call errorhandler with err object, the filname, the operationName, and Parms
    dpbutils.errorHandler(err, thisFilename, "GetItem", db_getter.dbParms());
})
