const winston  = require('winston');
var   _        = require("lodash");
const moment   = require("moment");
require("moment-timezone");


const loginfo_enabled = true;


/* ********************************************************************* */
/* Logging related functions                                             */
/* ********************************************************************* */

//  used to pluck just the filename from global variables
const pluckFilename = (filename, directory) =>  {
  return filename.substring(directory.length+1, filename.length);
}

// Used to log info. Can be turned off by settings 'loginfo_enabled' to false
const loginfo = (infotext) =>  {
  if (loginfo_enabled) {
    var logformat = "YYYY-MM-DD hh:mm:ss SSSS";
    winston.info(` ${moment().format(logformat)} ${infotext}  `);
  }
}

// Log error text
const logerror = (errortext, errorstack) =>  {
  var logformat = "YYYY-MM-DD hh:mm:ss SSSS";
  if (!errorstack) errorstack = "";
  winston.error(`${moment().format(logformat)} ${errortext} ${errorstack}  `);
}

const errorHandler = function errorHandler (err, filename, operationName, parmUsed) {
  // For some reason, there are times that err.name and err.message are null
  // and err object itself has the err.name. If so, set err.name to err value
  // and err.msg to empty string
  var errname = err.name || err;
  var errmsg  = err.msg  || "";
  var errcode = err.code || ""

  logerror(`'${filename}' >>>>>>> Error Encountered <<<<<<<`);
  /* Check here for ValidationException, ResourceNotFoundException, and ConditionalCheckFailedException */
  if (errname === "ValidationException" || errname === "ResourceNotFoundException" ||
        errname === "ConditionalCheckFailedException" || errcode === "ConditionalCheckFailedException")
  {
    if (errname === "ValidationException") {errmsg = "Item may not be Database, condition not met, or parm malformed";}
    var errMsg = operationName + " Failed due to " + errname + ": " + errmsg; //construct msg
    logerror(`'${filename}' ${errMsg}`);   // log error message
  } else  {      // not one of the Exceptions I'm checking, hence log stack trace
    logerror(`'${filename}' ${operationName} Failed due to ${errname}  ${errmsg}`);
    logerror(err, err.stack);
  }
  logerror(`'${filename}' Input parameters used: ${JSON.stringify(parmUsed,null,2)}`);
  logerror(`'${filename}' >>>>>>> End of Error text <<<<<<<`);
}


/* ********************************************************************* */
/* Date related functions                                             */
/* ********************************************************************* */

function currentDateTimestamp(dateString) {
  // return moment.utc().utcOffset(-05:00);
  if (dateString) {
    return moment(dateString).format('YYYY-MM-DDTHH:mm:ss.SSS');
  }
  return moment().format('YYYY-MM-DDTHH:mm:ss.SSS'); //.utcOffset('-05:00').format();
}

/* ********************************************************************* */
/* Error Messages: takes an error message name and message extension       */
/* ********************************************************************* */
const getErrMsg = function getErrMsg(msgName, msgExt = "")  {
    var errorTable = {
        DuplicateRecord: "Duplicate Record Error: Record already exist for " + msgExt,
        MissingParms:    "Missing Parms Error: Missing: " + msgExt,
        DBCountError:    "DB Count Error: Expected " + msgExt,
    }

    return errorTable[msgName];
}


module.exports = {
  pluckFilename,
  loginfo,
  logerror,
  loginfo_enabled,
  errorHandler,
  currentDateTimestamp,
  getErrMsg
}
