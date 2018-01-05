var dbtools = require("./../dbutils/dbtools");
var dpbutils = require("./../utils/dpbutils");

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log file execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

console.log(">>>>>>>> BEFOREALL STARTED <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
//  Initialize the values of the items in the putValues array
var putValues = [
     {"userid":"db00001", "appcode":"hmc", "appname":'Home Maintenance Checklist',
         "assetid":dbtools.getNewAssetId(), "backgroundImage":'myimageurl17',
         "defaultLoginScreen": 'Dashboard', "maxchecklists": 3, "locationReminders": false,
         "createDate": dpbutils.currentDateTimestamp(), "updDate": dpbutils.currentDateTimestamp('9999-01-01')
     },
     {"userid":"db00002", "appcode":"hmc", "appname":'Home Maintenance Checklist',
         "assetid":dbtools.getNewAssetId(), "backgroundImage":'myimageurl21',
         "defaultLoginScreen": 'Dashboard', "maxchecklists": 3, "locationReminders": false,
         "createDate": dpbutils.currentDateTimestamp(), "updDate": dpbutils.currentDateTimestamp('9999-01-01')
     },
     {"userid":"db00003", "appcode":"hmc", "appname":'Home Maintenance Checklist',
         "assetid":dbtools.getNewAssetId(), "backgroundImage":'myimageurl88',
         "defaultLoginScreen": 'Dashboard', "maxchecklists": 3, "locationReminders": false,
         "createDate": dpbutils.currentDateTimestamp(), "updDate": dpbutils.currentDateTimestamp('9999-01-01')
     },
     {"userid":"db00004", "appcode":"hmc", "appname":'Home Maintenance Checklist',
         "assetid":dbtools.getNewAssetId(), "backgroundImage":'myimageurl77',
         "defaultLoginScreen": 'Checklist', "maxchecklists": 3, "locationReminders": false,
         "createDate": dpbutils.currentDateTimestamp(), "updDate": dpbutils.currentDateTimestamp('9999-01-01')
     }
];

  // Initalize DynamoDB PutObjects array with a parameter object for each putValue above
var putObjects = [];
for (var i = 0; i < putValues.length; i++) {
    putObjects[i] = new dbtools.DbPutItem("AppSettings", putValues[i]);  // save dbparms at end of array
}

  /* FOLLOWING SECTION EXECUTES AN ARRAY OF PROMISES IN SEQUENCE              */
  /* The dbRequest() function is a the promise wrapper function and the       */
  /* sequence function wraps the reduce method                                */
  // Wrapper function that returns a promise with the main logic
function dbRequest(putObj) {
    //  console.log("IN DBRQUEST WRAPPER WITH THIS PARM OBJECT");
    //  console.log(putObj.dbParms());
    return putObj.executeDbRequest(putObj.dbParms());  // This returns a promise
}

// This function takes an array of put objects and a call back funtion that returns
// a promise
function sequence(array, callback) {
    return array.reduce(function chain(previousPromise, currentArrayItem) {
          // console.log("CURRENT ARRAY ITEM IN REDUCE IS") ;
          // console.log(currentArrayItem) ;
          return previousPromise.then( function () {
            return callback(currentArrayItem);
          });
    }, Promise.resolve());
};

sequence(putObjects, function (putObject) {
  return dbRequest(putObject).then(function (data) {
    // console.log("PUTTING VALUES FOR PUT OBJECT\n");
    // console.log(JSON.stringify(putObject, null, 2));
  })
}).catch(function (err) {
    console.log("ENCOUNTERED ERROR IN SEQUENCE FUNCTION");
    console.log(err);
});
