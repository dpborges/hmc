var awsconfig = require("./aws");
var _         = require("lodash");
var schema    = require("./../dbutils/schema");

AWS = awsconfig.AWS;

/* ************************************************************************ */
/* DbGetitem helper functions                                               */
/* ************************************************************************ */

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
/* ************************************************************************ */
/* DbPutitem helper functions                                               */
/* ************************************************************************ */
function DbPutItem (tablename, attribValues)  {
  this.tablename = tablename;
  this.attribValues = attribValues;
  this.tableDef  = DbPutItem.prototype.getTableDef(this.tablename)
  DbPutItem.prototype.mapValuestoAttribs(this.tableDef, this.attribValues);
};

DbPutItem.prototype = {

  getTableDef: function (tablename) {
    // console.log("<<< getTableDef >>>> \n" + JSON.stringify(schema.tabledef[tablename], null, 2));
    return schema.tabledef[tablename];
  },

  mapValuestoAttribs: function (tableDef, attribValues) {
    var keys = Object.keys(attribValues);
    /* for all the values passed in with valueObject, update the table defintion */
    /* with these values. */
    for (var i = 0; i < keys.length; i++) {
        // if (i === 0 || i ===1 ) { /* log primary and sort key used */
        //    console.log(`This is key ${i} used "${keys[i]}" => This is value "${attribValues[keys[i]]}""`);
        // }
        var keytype = Object.keys(tableDef.Item[[keys[i]]]);
        // td.Item[[keys[i]]][keytype] = valueObject[keys[i]]; /* used with type (eg. S:) was in schema */
        tableDef.Item[[keys[i]]] = attribValues[keys[i]];
    }
  },

  dbParms:  function () {
    // return JSON.stringify(this.parameter, null, 2);
    return this.tableDef;
  },

  /* Sets condition, such that if primary key exist, Put will not be executed */
  setNotExistConditionOn: function setNotExistConditionOn (primarykeyname) {
    this.tableDef.ConditionExpression = "attribute_not_exists(" + primarykeyname + ")";
  },


  executeDbRequest: function (params) {
     var promise = new Promise(
         function resolver(resolve, reject) {
           // Provide primary key and sort key values in the dynaomdb params object
          var docClient = new AWS.DynamoDB.DocumentClient();
          docClient.put(params, function(err, data) {
             if (err) {
               reject(err.name);
             } else {
               resolve(data);
             }
           }); /* end of docClient.get */
        } /* end of resolver */
    );
    return promise;
  }

} /* end of DbPutItem.prototype */


module.exports = {
  DbGetItem,
  DbPutItem
}
