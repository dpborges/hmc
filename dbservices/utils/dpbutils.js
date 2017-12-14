const winston  = require('winston');
const moment   = require("moment");
var   _        = require("lodash");

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
    var errMsg = operationName + " Failed due to " + errname + ": " + errmsg; //construct msg
    logerror(`'${filename}' ${errMsg}`);   // log error message
  } else  {      // not one of the Exceptions I'm checking, hence log stack trace
    logerror(`'${filename}' ${operationName} Failed due to ${errname}  ${errmsg}`);
    logerror(err, err.stack);
  }
  logerror(`'${filename}' Input parameters used: ${JSON.stringify(parmUsed,null,2)}`);
  logerror(`'${filename}' >>>>>>> End of Error text <<<<<<<`);
}

module.exports = {
  pluckFilename,
  loginfo,
  logerror,
  loginfo_enabled,
  errorHandler
}
