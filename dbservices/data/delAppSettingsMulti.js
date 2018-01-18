var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

console.log(">>>>>>>>> AFTERALL STARTED");
//  delete test items
var testItems = [
    {"userid":"db00001", "appcode":"hmc"},
    {"userid":"db00002", "appcode":"hmc"},
    {"userid":"db00003", "appcode":"hmc"},
    {"userid":"db00004", "appcode":"hmc"}
];

var deleteObjects = [];
for (var i = 0; i < testItems.length; i++) {
  deleteObjects[i] = new dbtools.DbDeleteItem()
  .setTableName("AppSettings")
  .setPrimaryKey("userid", testItems[i].userid)
  .setSortKey("appcode", testItems[i].appcode)
  .returnOldValues(true);
}

/* FOLLOWING SECTION EXECUTES AN ARRAY OF PROMISES IN SEQUENCE
   The dbRequest() function is used to wrap main execution logic in a promise
   This wrapper function must return a promise.
   The sequence function that follows,  wraps the reduce method which
   faciliates the sequencing */
function dbRequest(delObj) {
  //  console.log("IN DBRQUEST WRAPPER WITH THIS PARM OBJECT");
   console.log(delObj.dbParms());
   return delObj.executeDbRequest(delObj.dbParms());  // This returns a promise
}

// This function takes an array of delete objects and a call back function that returns
// a promise
function sequence(array, callback) {
    return array.reduce(function chain(previousPromise, currentArrayItem) {
          console.log("CURRENT ARRAY ITEM IN REDUCE IS") ;
          console.log(currentArrayItem) ;
          return previousPromise.then( function () {
            return callback(currentArrayItem);
          });
    }, Promise.resolve());
};

sequence(deleteObjects, function (delObject) {
    return dbRequest(delObject).then(function (data) {
      console.log("DELETING ITEMS FOR DELETE OBJECT\n");
      console.log(JSON.stringify(delObject, null, 2));
    });
}).catch(function (err) {
        console.log("ENCOUNTERED ERROR IN SEQUENCE FUNCTION");
        console.log(err);
});
