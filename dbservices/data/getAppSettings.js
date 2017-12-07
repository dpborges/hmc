var dpbutils   = require("./../utils/dpbutils");
var dbtools    = require("./../dbutils/dbtools");

const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// ***************************************************************************
// ** Sample DynamoDB getItem program
// ***************************************************************************
dpbutils.loginfo(`'${thisFilename}' Started`);
/* Initialize AWS Config parameters and Initialize client    */

/* Initialize data inputs */
var userid  = "db00001";

/* Set up DynamoDB getItem input parms */
db_getter = new dbtools.DbGetItem();
db_getter.setTableName("AppSettings");
db_getter.setPrimaryKey("userid", userid);
db_getter.setSortKey("appcode","hmc");
db_getter.execute(dbcallback);    // The Execute dbcallback function is defined below

/* Define Dynamodb call back logic here */
function dbcallback(err, data) {
  try {
      if (err) {
          throw new Error("DynamoDb: check all input parms for accuracy");
      } else {
          console.log("===================================");
          console.log(`AppSettings for user: ${userid} `);
          console.log("===================================");
          if (db_getter.hasResultSet(data)) {
            console.log(JSON.stringify(data.Item, null, 2));
          } else {
            dpbutils.logerror(`'${thisFilename}' Resultset empty for follwowing input parameters: `);
            // console.log(`Record with key structure below, not found \n${db_getter.keyUsed()}`);
            db_getter.toString();
         }
      } /* else end */
    } /* end try */
  catch (e) {
    dpbutils.logerror(`'${thisFilename}' ${e.name} ${e.message} ${e.stack}`);
  } finally {
    dpbutils.loginfo(`'${thisFilename}' Ended`);
  }
};
