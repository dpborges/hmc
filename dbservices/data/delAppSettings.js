var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// Set up parameters to get an item
db_deleter = new dbtools.DbDeleteItem()
    .setTableName("AppSettings")
    .setPrimaryKey("userid", "db00008")
    .setSortKey("appcode","hmc")
    // .incrementValueBy(1).forAttribute("lastChecklistId");
    .deleteItemWhere("lastChecklistId").is("=").toValue(100)

 console.log(JSON.stringify(db_deleter.dbParms(), null, 2));

// Execute database call
db_deleter.executeDbRequest(db_deleter.dbParms()).then(function(data) {
    if (!db_deleter.hasResultSet(data)) {
      dpbutils.loginfo(`'${thisFilename}' Database delete completed successfully: `);
    } else {
      dpbutils.loginfo(`'${thisFilename}' Database callback returned Data: `);
      console.log(data);
    }
    //  Log DB request has Ended
    dpbutils.loginfo(`'${thisFilename}' Ended`);

}).catch(function(err) {
    // Call errorhandler with err object, the filname, the operationName, and Parms
    if (err.code === "ConditionalCheckFailedException") {
      /* write code here if record does not exist */
      console.log("######################### Item(s) does not exist - check your ConditionExpression");
    }
    dpbutils.errorHandler(err, thisFilename, "DeleteItem", db_deleter.dbParms());
})
