// function Checklist () {

//   this.assetId = "uuid";
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
// }


const ChecklistConfig = {
  appcode:  "hmc",
  category: "Home Maintenance Checklist",
  domain:   "ckls",
}

/* ========================================================================== */
/* Checklist base class
/* ========================================================================== */
function Checklist (clid) {
  this.assetid =  clid || "";
  this.appcode  = ChecklistConfig.appcode;
  this.domain   = ChecklistConfig.domain;
  this.category = ChecklistConfig.catetory;
  this.userid  = "";
  this.name    = "";
  this.status  = "not started";
  this.numTasks           = 0;
  this.numTasksCompleted  = 0;
  this.numTasksIgnored    = 0;
  this.numCategories      = 0;
  this.createDate         = "12/12";
  this.updDate            = "";
}

Checklist.prototype = {

}


hmc = new Checklist("a;f;asjf;ajs");

//
// HomeMaintChecklistObject = new HmChecklist();
// hmc = inherit()


hmc.dataProp = "proj";
console.log(hmc.fooProp);
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
