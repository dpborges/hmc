var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// Set up parameters to get an item
db_updater = new dbtools.DbUpdateItem()
    .setTableName("AppSettings")
    .setPrimaryKey("userid", "db00001")
    .setSortKey("appcode","hmc")
    // .incrementValueBy(1).forAttribute("lastChecklistId")
    .updateAttrib("locationReminders").withValue(false)
    // .updateAttrib("lastChecklistId").withValue(747)
    .onlyIf("lastChecklistId").is("=").theValue(3); // condition expression

console.log(JSON.stringify(db_updater.dbParms(), null, 2));

// Execute database call
// db_updater.executeDbRequest(db_updater.dbParms()).then(function(data) {
//     if (!db_updater.hasResultSet(data)) {
//       dpbutils.loginfo(`'${thisFilename}' Database update completed successfully: `);
//     } else {
//       dpbutils.loginfo(`'${thisFilename}' Database callback returned Data: `);
//     }
//     //  Log DB request has Ended
//     dpbutils.loginfo(`'${thisFilename}' Ended`);
//
// }).catch(function(err) {
//     // Call errorhandler with err object, the filname, the operationName, and Parms
//     // if (err.code === "ValidationException") {
//     //   // console.log("Validation Exception on update: More than likely item key was not found in the database ");
//     //   err = "ValidationException: More than likely item key was not found in the database";
//     // }
//     dpbutils.errorHandler(err, thisFilename, "PutItem", db_updater.dbParms());
//     // dpbutils.errorHandler(err, "update.js", "PutItem", db_updater.dbParms());
// })
