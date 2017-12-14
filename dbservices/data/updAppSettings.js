var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// Set up parameters to get an item
db_updater = new dbtools.DbUpdateItem()
    .setTableName("AppSettings")
    .setPrimaryKey("_ userid", "db00550")
    .setSortKey("appcode","hmc")
    // .incrementValueBy(1).forAttribute("lastChecklistId");
    .updateAttrib("locationReminders").withValue(true)
    .updateAttrib("lastChecklistId").withValue(777);

// Execute database call
db_updater.executeDbRequest(db_updater.dbParms()).then(function(data) {
    if (!db_updater.hasResultSet(data)) {
      dpbutils.loginfo(`'${thisFilename}' Database update completed successfully: `);
    } else {
      dpbutils.loginfo(`'${thisFilename}' Database callback returned Data: `);  
    }
    //  Log DB request has Ended
    dpbutils.loginfo(`'${thisFilename}' Ended`);

}).catch(function(err) {
    // Call errorhandler with err object, the filname, the operationName, and Parms
    dpbutils.errorHandler(err, thisFilename, "PutItem", db_updater.dbParms());
    // dpbutils.errorHandler(err, "update.js", "PutItem", db_updater.dbParms());
})
