const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

const ChecklistConfig = {
  appcode:    "hmc",
  category:   "Home Maintenance Checklist",
  datadomain: "ckls"
}

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log message that execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

/* ========================================================================== */
/* Checklist base class
/* ========================================================================== */
function Checklist (clid) {
  this.assetid =  clid || "";
  this.appcode  = ChecklistConfig.appcode;
  this.datadomain   = ChecklistConfig.datadomain;
  this.category = ChecklistConfig.catetory;
  this.userid  = "";
  this.chklistname    = "";
  this.chklistnameplus    = "";
  this.status  = "not started";
  this.numTasks           = 0;
  this.numTasksCompleted  = 0;
  this.numTasksIgnored    = 0;
  this.numCategories      = 0;
  this.createDate         = "12/12";
  this.updDate            = "";
}

Checklist.prototype = {

    getAssetid: function getAssetid () { return this.assetid;},
    getAppcode: function getAppcode () { return this.appcode;},
    getDatadomain: function getDatadomain () { return this.datadomain;},

    setUser: function setUser (uid) {this.userid = uid},
    getUser: function getUser ()    {return this.userid;},

    setChklistname: function setChklistnameName (clname) {this.chklistname = clname; return this;},
    getChklistname: function getChklistnameName () {return this.chklistname;},

    setChklistnameplus: function setChklistnameNameplus (clnamep) {this.chklistnameplus = clnamep;},
    getChklistnameplus: function getChklistnameNameplus () {return this.chklistnameplus; return this;},

    saveChklist: function saveChklist (userid) {
      /* provide values you would like to insert into table  */
      var putValues = {
        assetid:      this.assetid,
        userid:       this.userid,
        chklistname:  this.chklistname,
        appcode:      this.appcode,
        datadomain:   this.datadomain,
        chklistnameplus: this.chklistnameplus
      };

      /* Pass in table name and the putValues to DbPutItem constructor */
      var db_puter  = new dbtools.DbPutItem("HMChecklist", putValues);

      db_puter.setNotExistConditionOn(this.assetid);   // set condition such that you execute put only
                                                  //     if attribute here does not exist in table

      /* ========================================================================== */
      /* Execute PutItem command
      /* ========================================================================== */

      /* execute Put item database request */
      db_puter.executeDbRequest(db_puter.dbParms()).then(function(data) {
          if (dpbutils.loginfo_enabled) {
            dpbutils.loginfo(`'${thisFilename}' Put Item request completed successfully: ${JSON.stringify(db_puter.dbParms(),null,2)}`);
          }

          //  Log DB request has Ended
          dpbutils.loginfo(`'${thisFilename}' Ended`);
      }).catch(function(err) {
        // Call errorhandler with err object, the filname, the operationName, and Parms
        dpbutils.errorHandler(err, thisFilename, "PutItem", db_puter.dbParms());
      })
    } /* end of saveChklist */
} /* end of prototype */




hmc = new Checklist("a;f;asjf;ajs");
hmc.setUser("db00004");
hmc.setChklistname("Home Maintenance Checklist")
   .setChklistnameplus("Primary Residence");

console.log(hmc);
hmc.saveChklist();

// console.log(hmc.domain);

// console.log(`${hmc.toString()}`);

// console.log(`appcode: ${hmc.appcode}`);
// hmc.appcode ="SoccerMeet Checklist";
// console.log(`appcode: ${hmc.appcode}`);



// function Checklist (clid) {
//
//   this.assetId = clid || "";

//
//   /* needs to get inherited from  HomMaintenanceChecklist */
//   this.assetAppCode = "hmc";
//   this.assetDomain  = "ckls";
//   this.category     = "Home Maintenance";
//
//   if (this.assetId !== "") {
//     Checklist.protoptype.loadChecklist(clid);
//   }
// }
//
// Checklist.prototype = {
//
//   setUser: function setUser (userid) {
//
//     return arrayOfChecklists;
//   },
//
//   setName: function setName (userid) {
//
//     return arrayOfChecklists;
//   },





// console.log(`Appcode ${hmc.assetAppCode});


// function Checklist (clid) {
//
//   this.assetId = clid || "";
//   this.userid  = "";
//   this.name    = "";
//   this.status  = "not started";
//   this.numTasks           = 0;
//   this.numTasksCompleted  = 0;
//   this.numTasksIgnored    = 0;
//   this.numCategories      = 0;
//   this.createDate         = "";
//   this.updDate            = "";
//
//   /* needs to get inherited from  HomMaintenanceChecklist */
//   this.assetAppCode = "hmc";
//   this.assetDomain  = "ckls";
//   this.category     = "Home Maintenance";
//
//   if (this.assetId !== "") {
//     Checklist.protoptype.loadChecklist(clid);
//   }
// }
//
// Checklist.prototype = {
//
//   setUser: function setUser (userid) {
//
//     return arrayOfChecklists;
//   },
//
//   setName: function setName (userid) {
//
//     return arrayOfChecklists;
//   },
//
//   setNameQualifier: function setNameQualifier (userid) {
//
//     return arrayOfChecklists;
//   },
//
//   setStatus: function setNameQualifier (userid) {
//
//     return arrayOfChecklists;
//   },
//
//   incrNumTasks: function incrNumTasks (incrementValue) {
//
//
//   },
//
//   incrNumTasksCompleted: function incrNumTasksCompleted (incrementValue) {
//
//
//   },
//
//   incrNumTasksIgnored: function incrNumTasksIgnored (incrementValue) {
//
//
//   },
//
//   incrNumCategories: function incrNumCategories (incrementValue) {
//
//   },
// // ===========================================================
// // SHOULD BE PART OF HOME MAINTENANCE PROTOTYPE OBJECT
//   // getAssetId: function getAssetId () {
//   //   return this.assetId;
//   // },
//   //
//   // getAssetDomain: function getAssetDomain () {
//   //   return this.assetDomain;
//   // },
//   //
//   // getCategory: function getCategory () {
//   //    return this.category;
//   // },
//
//
// // END OF HOME MAINTENANCE PROTOTYPE OBJECT
// // ===========================================================
//
//   /* Retrieves checklist for given user */
//   getChecklists: function geChecklists ( ) {
//
//     return arrayOfChecklists;
//   },
//
//   /* Retrieves checklist for given user */
//   getChecklistById: function getChecklistById (clid) {
//
//     return Checklists;
//   },
//
//   saveChecklist: function save () {
//      this.assetId = getUuid();
//      this.createDate = new Date();
//   },
//
//   loadChecklist: function loadChecklist (clid) {
//
//   }
// }
