const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

/* ========================================================================== */
/* Provide values you would like to check that do not alread exist
/* ========================================================================== */
db_query = new dbtools.DbQuery()
  .setTableName("HMChecklist")
    // .setPrimaryKey("userid", "db00550")   // This setS KeyCondition Expression and
                                           // and Expression Attribute Values
  .selectItemsWherePrimaryKey("userid").is("=").theValue("db00002");
  // .theSortKey("appcode").is("=").theValue("hmc")
    // .theSortKey("SongTitle").matchPattern("begins_with").theValue("Today")
  // .where("chklistname").is("=").theValue("Home Maintenance Checklist");   // Filter Criteria
  // .returnOnly("locationReminders");   // projection expression; list of attributes

  db_query.executeDbRequest(db_query.dbParms()).then(function(data) {
      if (db_query.hasResultSet(data)) {
        dpbutils.loginfo(`'${thisFilename}' Database query completed successfully: Record count = ${data.Count}`);
        if (data.Count === 0) {
          /* logic here when no results */
        } else {
          console.log(data);
        }
      }
      //  Log DB request has Ended
      dpbutils.loginfo(`'${thisFilename}' Ended`);

  }).catch(function(err) {
      // Call errorhandler with err object, this filname, the operationName, and Parms
      dpbutils.errorHandler(err, thisFilename, "Query", db_query.dbParms());
  })





/* ========================================================================== */
/* Set up: provide put values and condition to do a put only PK does not exist
/* ========================================================================== */

/* provide values you would like to insert into table  */

// var putValues = {
//   userid:   "db00021",
//   appcode:  "hmc",
//   lastChecklistId: 12,
//   locationReminders: true
//   // checklistname: "this id checklist #1"
// };
//
// /* Pass in table name and the putValues to DbPutItem constructor */
// var db_puter  = new dbtools.DbPutItem("HMChecklist", putValues);
//
// db_puter.setNotExistConditionOn("userid");   // set condition such you execute put only
//                                             //     if userid does not exist in table
//
// /* ========================================================================== */
// /* Execute PutItem command
// /* ========================================================================== */
//
// /* execute Put item database request */
// db_puter.executeDbRequest(db_puter.dbParms()).then(function(data) {
//     if (dpbutils.loginfo_enabled) {
//       dpbutils.loginfo(`'${thisFilename}' Put Item request completed successfully: ${JSON.stringify(db_puter.dbParms(),null,2)}`);
//     }
//
//     //  Log DB request has Ended
//     dpbutils.loginfo(`'${thisFilename}' Ended`);
// }).catch(function(err) {
//   // Call errorhandler with err object, the filname, the operationName, and Parms
//   dpbutils.errorHandler(err, thisFilename, "PutItem", db_puter.dbParms());
// })
