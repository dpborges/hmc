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
    return this;
  },

  setPrimaryKey: function (pkname, pkvalue) {
    this.parameter.Key[pkname] = pkvalue;
    this.pkname = pkname;
    this.pkvalue = pkvalue;
    return this;
  },

  setSortKey: function (sortkeyname, sortkeyvalue) {
      this.parameter.Key[sortkeyname] = sortkeyvalue;
      return this;
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
    return this;
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

/* ************************************************************************ */
/* Db update helper functions                                               */
/* ************************************************************************ */

function DbUpdateItem ()  {
  this.parameter = {};
  this.parameter.TableName = undefined;
  this.parameter.Key = {};
  this.parameter.UpdateExpression = "set ";
  this.parameter.ExpressionAttributeValues = {};
  this.fieldcounter = 0;
};

DbUpdateItem.prototype = {

  setTableName: function (table) {
    this.parameter.TableName = table;
    return this;
  },

  setPrimaryKey: function (pkname, pkvalue) {
    this.parameter.Key[pkname] = pkvalue;
    // this.pkname = pkname;
    // this.pkvalue = pkvalue;
    return this;
  },

  setSortKey: function (sortkeyname, sortkeyvalue) {
      this.parameter.Key[sortkeyname] = sortkeyvalue;
      return this;
  },

  updateAttrib: function updateAttrib (attribName) {
    console.log("Length of UpdExpression is " + this.parameter.UpdateExpression.length);
    var comma = ",";  // add comma only if adding second assignment. Not needed on initial assignment
    if (this.parameter.UpdateExpression.length === 4) {   // No comma needed, as just has the string "set "
      this.parameter.UpdateExpression = this.parameter.UpdateExpression + " " + attribName + " = ";
    } else {
     this.parameter.UpdateExpression = this.parameter.UpdateExpression + comma + " " + attribName + " = ";
    }
    return this;
  },

  withValue: function withValue (theUpdValue) {
    this.fieldcounter++;
    var attribValRef = ":v" + this.fieldcounter;
    this.parameter.ExpressionAttributeValues[attribValRef] = theUpdValue;
    this.parameter.UpdateExpression = this.parameter.UpdateExpression + " " + attribValRef;
    return this;
  },

  incrementValueBy:  function incrementValueBy (theNum) {
    this.parameter.ExpressionAttributeValues[":incr"] =  theNum;
    return this;
  },

  forAttribute: function forAttribute (theAttrib) {
  //  this.parameter.UpdateExpression = "SET " + theAttrib + " = " + theAttrib " + "  + ":incr";
   this.parameter.UpdateExpression = `SET ${theAttrib} =  ${theAttrib} + :incr`;
   return this;
  },

  hasResultSet: function (result) {return !(_.isEmpty(result)); },

  executeDbRequest: function (params) {
     var promise = new Promise(
         function resolver(resolve, reject) {
           // Provide primary key and sort key values in the dynaomdb params object
          var docClient = new AWS.DynamoDB.DocumentClient();
          docClient.update(params, function(err, data) {
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

  // keyUsed:  function () {
  //   return JSON.stringify(this.parameter.Key, null, 2);
  // },

  dbParms:  function () {
    // return JSON.stringify(this.parameter, null, 2);
    return this.parameter;
  },

  toString: function () {
    console.log(JSON.stringify(this.parameter, null, 2));
    return this;
  }
}

/* ************************************************************************ */
/* Db delete helper functions                                               */
/* ************************************************************************ */
function DbDeleteItem ()  {
  this.parameter = {};
  this.parameter.TableName = undefined;
  this.parameter.Key = {};
  this.parameter.ConditionExpression = "";
  this.parameter.ExpressionAttributeValues = {};
  this.parameter.ReturnValues = "ALL_OLD";
  this.fieldcounter = 0;
  // this.theConditionalAttrib = undefined;
};

DbDeleteItem.prototype = {

  setTableName: function (table) {
    this.parameter.TableName = table;
    return this;
  },

  setPrimaryKey: function (pkname, pkvalue) {
    this.parameter.Key[pkname] = pkvalue;
    // this.pkname = pkname;
    // this.pkvalue = pkvalue;
    return this;
  },

  setSortKey: function (sortkeyname, sortkeyvalue) {
      this.parameter.Key[sortkeyname] = sortkeyvalue;
      return this;
  },

  deleteItemWhere: function deleteItemWhere (theConditionalAttrib) {
    this.parameter.ConditionExpression = theConditionalAttrib;
    return this;
  },

  is: function is (operator) {
    this.parameter.ConditionExpression = this.parameter.ConditionExpression + " " + operator;
    return this;
  },

  toValue: function toValue (theConditionalValue) {
    this.fieldcounter++;
    this.parameter.ConditionExpression = this.parameter.ConditionExpression +
                   " :v" + this.fieldcounter;
    this.parameter.ExpressionAttributeValues[":v" + this.fieldcounter] = theConditionalValue;
    return this;
  },


  hasResultSet: function (result) {return !(_.isEmpty(result)); },

  executeDbRequest: function (params) {
     var promise = new Promise(
         function resolver(resolve, reject) {
           // Provide primary key and sort key values in the dynaomdb params object
          var docClient = new AWS.DynamoDB.DocumentClient();
          docClient.delete(params, function(err, data) {
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

  // keyUsed:  function () {
  //   return JSON.stringify(this.parameter.Key, null, 2);
  // },

  dbParms:  function () {
    // return JSON.stringify(this.parameter, null, 2);
    return this.parameter;
  },

  toString: function () {
    console.log(JSON.stringify(this.parameter, null, 2));
    return this;
  }
}


module.exports = {
  DbGetItem,
  DbPutItem,
  DbUpdateItem,
  DbDeleteItem

}
