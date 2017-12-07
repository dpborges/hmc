var aws = require("./aws");
var _   = require("lodash");

AWS = aws.AWS;

function DbGetItem ()  {
  this.parameter = {};      // Initialize dynamodb params object
  this.parameter.Key = {};  // Initialized dynamodb Key object
  this.docClient = new AWS.DynamoDB.DocumentClient();

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

  execute: function (callback) {
      this.docClient.get(db_getter.parameter, callback); /* docClient.get end */
  },

  hasResultSet: function (result) {return !(_.isEmpty(result)); },

  keyUsed:  function () {
    return JSON.stringify(this.parameter.Key, null, 2);
  },

  toString: function () {console.log(JSON.stringify(this.parameter, null, 2));}
}

module.exports = {
  DbGetItem
}
