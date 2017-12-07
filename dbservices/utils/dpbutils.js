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
const logerror = (errortext) =>  {
  var logformat = "YYYY-MM-DD hh:mm:ss SSSS";
  winston.error(`${moment().format(logformat)} ${errortext}  `);
}

module.exports = {
  pluckFilename,
  loginfo,
  logerror
}
