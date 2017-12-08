var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

// Set up parameters
db_getter = new dbtools.DbGetItem();
db_getter.setTableName("AppSettings");
db_getter.setPrimaryKey("userid", "db00001");
db_getter.setSortKey("appcode","hmc");

// Execute database call
db_getter.executeDbRequest(db_getter.dbParms()).then(function(data) {
    if (db_getter.hasResultSet(data)) {
      console.log(JSON.stringify(data.Item, null, 2));
    } else {
      dpbutils.loginfo(`'${thisFilename}' Resultset empty for follwowing input parameters: `);
      console.log(JSON.stringify(db_getter.dbParms(), null, 2));
   }

  //  Log DB request has Ended
  dpbutils.loginfo(`'${thisFilename}' Ended`);

}).catch(function(err) {
      console.log("*********** Error Encountered *******************");
      console.log(err, err.stack);
      console.log("*********** End of Error text *******************");
})
