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

  returnOnly:  function returnOnly (attributeList) {
    this.parameter.ProjectionExpression = attributeList;
    return this;
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

    var tabledefKeys = Object.keys(tableDef.Item); // get number of attributes on table

    if (tabledefKeys.length !== keys.length) {
      // throw exception, if attributes on table do match number of put values,
      throw Error("Schema Error; put values do not match number of attributes on schema definition");
    }

    /* for all the values passed in with valueObject, update the table defintion */
    /* with these values. */
    for (var i = 0; i < keys.length; i++) {
        var keytype = Object.keys(tableDef.Item[[keys[i]]]);
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

  onlyIf: function onlyIf (theAttrib) {
  //  this.parameter.UpdateExpression = "SET " + theAttrib + " = " + theAttrib " + "  + ":incr";
   this.parameter.ConditionExpression = theAttrib;
   return this;
  },

  is: function is (operator) {
  //  this.parameter.UpdateExpression = "SET " + theAttrib + " = " + theAttrib " + "  + ":incr";
   this.parameter.ConditionExpression = `${this.parameter.ConditionExpression} ${operator}`;
   return this;
  },

  theValue: function theValue (theVal) {
    this.fieldcounter++;
    var attribValRef = ":v" + this.fieldcounter;
    this.parameter.ConditionExpression = `${this.parameter.ConditionExpression} ${attribValRef}`;
    this.parameter.ExpressionAttributeValues[attribValRef] = theVal;
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
  // this.parameter.ExpressionAttributeValues = {};
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

  whereAttribute: function whereAttribute (theConditionalAttrib) {
    // initialize Expression Attributes only if undefined; this avoids intializing
    // everytime whereAttribute is called
    if (this.parameter.ExpressionAttributeValues === undefined) {
      this.parameter.ExpressionAttributeValues = {};
    }
    // build condition expression
    this.parameter.ConditionExpression = theConditionalAttrib;
    return this;
  },

  is: function is (operator) {
    this.parameter.ConditionExpression = this.parameter.ConditionExpression + " " + operator;
    return this;
  },

  toValue: function toValue (theValue) {
    this.fieldcounter++;
    this.parameter.ConditionExpression = this.parameter.ConditionExpression +
                   " :v" + this.fieldcounter;
    this.parameter.ExpressionAttributeValues[":v" + this.fieldcounter] = theValue;
    return this;
  },

  whereAttributeNotExist: function whereAttributeNotExist (theAttrib) {
    var andWord = "";
    if (this.parameter.ConditionExpression.length > 2){
      andWord = "and";
    }
    this.parameter.ConditionExpression = `${this.parameter.ConditionExpression} ${andWord} attribute_not_exists(${theAttrib})`;
    return this;
  },

  returnOldValues: function returnOldValues (wantOldValues) {
    if (wantOldValues) {
      this.parameter.ReturnValues = "ALL_OLD";
    }
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

/* ************************************************************************ */
/* Db query helper functions                                               */
/* ************************************************************************ */
function DbQuery ()  {
  this.parameter = {};
  this.parameter.TableName = undefined;
  this.parameter.KeyConditionExpression = "";
  // this.parameter.FilterExpression = "";  ADD THIS ONLY WITH FILTER METHOD
  this.parameter.ExpressionAttributeValues = {};
  this.fieldcounter = 0;
  this.lastMethodCalled = undefined;     // This is set to either where,
  // selectItemsWherePrimaryKey, theSortKey.
  // The is() method will append value to key condition expression or filter expression
  // depending on which method was called last called.
  // this.primarykey = "";
  // this.sortkey = "";
  this.lastAttribute = "";    // this is last attribute
  this.lastMatchPattern = ""; // this is parameter passed in the matchPattern method.
  this.lastPredicate = "";    // This is either "is"  or "matchPattern"
};

DbQuery.prototype = {

  setTableName: function setTableName (table) {
    this.parameter.TableName = table;
    return this;
  },

  selectItemsWherePrimaryKey: function selectItemsWherePrimaryKey (attribName) {
    // Save lastAttribute and lastMethodCalled so subsequent predicate function
    // knows how to format params based on whether predicate "matchPatter" or "is"
    this.lastAttribute = attribName;
    this.lastMethodCalled = "selectItemsWherePrimaryKey";
    return this;
  },

  is: function is (operator) {
    var theAppendString = "";

    if (this.parameter.KeyConditionExpression.length > 3) {
      var theAppendString =  theAppendString + " and ";
    }

    if (this.lastMethodCalled === "theSortKey" || this.lastMethodCalled === "selectItemsWherePrimaryKey")
    {
      var theAppendString = theAppendString + `${this.lastAttribute} ${operator}`;
      this.parameter.KeyConditionExpression = this.parameter.KeyConditionExpression + theAppendString ;
    }

    if (this.lastMethodCalled === "where")
    {
      var theAppendString = theAppendString + `${this.lastAttribute} ${operator}`;
      this.parameter.FilterExpression = this.parameter.FilterExpression + " " + operator;
    }

    this.lastPredicate = "is";
    return this;
  },

  theValue: function theValue (value) {

    if ((this.lastMethodCalled === "theSortKey" || this.lastMethodCalled === "selectItemsWherePrimaryKey")
        && (this.lastPredicate === "is"))
    { //append generated placeholder to KeyCondition Expression and
      //the placeholder and value to ExpressionAttributeValues
      this.fieldcounter++;
      this.parameter.KeyConditionExpression = this.parameter.KeyConditionExpression + " :v" + this.fieldcounter;
      this.parameter.ExpressionAttributeValues[":v" + this.fieldcounter] = value;
    }

    if ((this.lastMethodCalled === "theSortKey" || this.lastMethodCalled === "selectItemsWherePrimaryKey")
         && (this.lastPredicate === "matchPattern"))
    { // same as 1st if statement, but tacking on close parens
      this.fieldcounter++;
      this.parameter.KeyConditionExpression = this.parameter.KeyConditionExpression + " :v" + this.fieldcounter + ")";
      this.parameter.ExpressionAttributeValues[":v" + this.fieldcounter] = value;
    }

    if ((this.lastMethodCalled === "where") && (this.lastPredicate === "is"))
    { //append to Filter Expression and ExpressionAttributeValues
      this.fieldcounter++;
      this.parameter.FilterExpression = this.parameter.FilterExpression + " :v" + this.fieldcounter;
      this.parameter.ExpressionAttributeValues[":v" + this.fieldcounter] = value;
    }

    return this;
  },

  // theValue: function theValue (value) {
  //   var theAppendString = "";
  //   console.log('LAST PATTERN ', this.lastMatchPattern);
  //   console.log('LAST ATTRIB ', this.lastAttribute);
  //   if (this.lastMethodCalled === "selectItemsWherePrimaryKey") {
  //     theAppendString = theAppendString + this.lastAttribute + ",";
  //
  //     if (this.lastMatchPattern === "begins_with") {
  //        theAppendString = theAppendString + " " + value;
  //     }
  //     this.parameter.KeyConditionExpression = this.parameter.KeyConditionExpression + theAppendString;
  //   }
  // },

  where: function where (theAttrib) {
    this.parameter.FilterExpression = theAttrib;
    this.lastMethodCalled = "where";
    return this;
 },

  theAttribute: function theAttribute (theAttrib) {
    var theAppendString = "";
    if (this.lastMethodCalled === "selectItemsWherePrimaryKey") {
      if (this.parameter.KeyConditionExpression.length > 2)
      { // then append literal 'and'  with the attribute name
        theAppendString = theAppendString + " and";
        this.parameter.KeyConditionExpression = this.parameter.KeyConditionExpression + theAppendString;
      }
      // save the attribute for next call
      this.lastAttribute = theAttrib;
   } else {
     ;
   }
 },

 theSortKey: function theSortKey (theAttrib) {
    // Save lastAttribute and lastMethodCalled so subsequent predicate function
    // knows how to format params based on whether predicate "matchPatter" or "is"
    this.lastAttribute = theAttrib;
    this.lastMethodCalled = "theSortKey";
    return this;
  },

  matchPattern: function matchPattern (thePattern) {
    var theAppendString = "";

    theAppendString = theAppendString + " and " + thePattern;

    if (thePattern === "begins_with" || thePattern === "contains") {
          theAppendString = theAppendString + "(";
    }

    theAppendString = theAppendString + this.lastAttribute;
    this.parameter.KeyConditionExpression = this.parameter.KeyConditionExpression + theAppendString;
    this.lastMatchPattern = thePattern;

   this.lastPredicate = "matchPattern";
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

  returnOnly:  function returnOnly (attributeList) {
    this.parameter.ProjectionExpression = attributeList;
    return this;
  },

  hasResultSet: function (result) {return !(_.isEmpty(result)); },

  executeDbRequest: function (params) {
     var promise = new Promise(
         function resolver(resolve, reject) {
           // Provide primary key and sort key values in the dynaomdb params object
          var docClient = new AWS.DynamoDB.DocumentClient();
          docClient.query(params, function(err, data) {
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
  DbDeleteItem,
  DbQuery
}
