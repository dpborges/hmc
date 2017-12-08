var awsconfig = require("./aws");
var _   = require("lodash");

AWS = awsconfig.AWS;

function DbGetItem ()  {
  this.parameter = {};      // Initialize dynamodb params object
  this.parameter.Key = {};  // Initialized dynamodb Key object
  this.pkname = undefined;
  this.pkvalue = undefined;
};

DbGetItem.prototype = {

  setTableName: function (table) {
    this.parameter.TableName = table;
  },

  setPrimaryKey: function (pkname, pkvalue) {
    this.parameter.Key[pkname] = pkvalue;
    this.pkname = pkname;
    this.pkvalue = pkvalue;
  },

  setSortKey: function (sortkeyname, sortkeyvalue) {
      this.parameter.Key[sortkeyname] = sortkeyvalue;
  },

  executeDbRequest: function (params) {
     var promise = new Promise(
         function resolver(resolve, reject) {
           // Provide primary key and sort key values in the dynaomdb params object
          var docClient = new AWS.DynamoDB.DocumentClient();
          docClient.get(params, function(err, data) {
             if (err) {
               reject(err);
             } else {
               resolve(data);
             }
           }); /* end of docClient.get */
        } /* end of resolver */
    );
    return promise;
  },

  hasResultSet: function (result) {return !(_.isEmpty(result)); },

  keyUsed:  function () {
    return JSON.stringify(this.parameter.Key, null, 2);
  },

  dbParms:  function () {
    // return JSON.stringify(this.parameter, null, 2);
    return this.parameter;
  },

  toString: function () {
    console.log(JSON.stringify(this.parameter, null, 2));
  }
}

module.exports = {
  DbGetItem
}
