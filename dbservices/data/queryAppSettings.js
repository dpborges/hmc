var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// Set up parameters to get an item
/* EXAMPLE #1 */
// db_query = new dbtools.DbQuery()
//     .setTableName("AppSettings")
//     .setPrimaryKey("_ userid", "db00550")   // This setS KeyCondition Expression and
//     .setSortKey("appcode","hmc")            // and Expression Attribute Values
//

// /* EXAMPLE #2 */
// db_query = new dbtools.DbQuery()
//     .setTableName("AppSettings")
//     .setPrimaryKey("userid", "db00550")   // This setS KeyCondition Expression and
                                            // and Expression Attribute Values

/* EXAMPLE #3 */
db_query = new dbtools.DbQuery()
    .setTableName("AppSettings")
    // .setPrimaryKey("userid", "db00550")   // This setS KeyCondition Expression and
                                           // and Expression Attribute Values
    .selectItemsWhere("Artist").is("=").theValue("No one you know")  // Primary Key match
    .theAttribute("SongTitle").is("=").theValue("Call me today");    // Sort Key match
    .theAttribute("SongTitle").matchPattern("contains").theValue("Today") // Key conditions
    .where("price").is("<").theValue("1.00");   // Filter Criteria

console.log(JSON.stringify(db_query.dbParms(),null, 2));

// db_query = new dbtools.DbQuery()
//     .setTableName("AppSettings")
//     .setPrimaryKey("userid", "db00001")
//     .selectItemsWhere()
//
//     // .incrementValueBy(1).forAttribute("lastChecklistId");
//     .selectItemsWhere()
//     .updateAttrib("lastChecklistId").withValue(777);





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
//     dpbutils.errorHandler(err, thisFilename, "PutItem", db_updater.dbParms());
//     // dpbutils.errorHandler(err, "update.js", "PutItem", db_updater.dbParms());
// })
