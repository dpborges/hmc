const _   = require("lodash");

const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

const BoConfig = {
  appcode:          "hmc",
  category:         "Home Maintenance",
  datadomain:       "ckls",
  cklsTable:        "HomeMaintChecklist",
  taskTable:        "HomeMaintTaskDetails"
}

// Intialize file name for logging purposes
const thisFilename = dpbutils.pluckFilename(__filename, __dirname);

// Log message that execution has started
dpbutils.loginfo(`'${thisFilename}' Started`);

/* ========================================================================== */
/* Checklist Constructor
/* ========================================================================== */
function Checklist (user_id) {
  this.userid  = user_id;
  this.chklistname    = "";
  this.nameQualifier  = ""   // this gets concatenated to chklistname with a pipe as a prmary name qualifier
  // this.chklist_ext    = {};  // Other checklist attributes (eg. region, dept, etc)
  this.userCategories = [];
  this.clstatus  = "not started";
  this.hide_dones = "false";
  this.clmetrics = {
      totalTasks: 0,
      tasksOverdue: 0,
      tasksDone: 0,
      tasksDueToday: 0,
      tasksDueThisWk:0,
      tasksUpcoming: 0,
      tasksIgnored: 0
  };
  this.assetid =  "";
  this.createDate         = "";
  this.updDate            = "";
  this.appcode  = BoConfig.appcode;
  this.datadomain   = BoConfig.datadomain;
  this.category = BoConfig.category;

  this.clipboard   = {};
  this.addCategory("_root_");
};

Checklist.prototype = {

    // getAssetid: function getAssetid () { return this.assetid;},
    // getAppcode: function getAppcode () { return this.appcode;},
    // getDatadomain: function getDatadomain () { return this.datadomain;},

    setUser: function setUser (uid) {this.userid = uid},
    getUser: function getUser ()    {return this.userid;},

    setChklistname: function setChklistnameName (clname) {this.chklistname = clname; return this;},
    getChklistname: function getChklistnameName () {return this.chklistname;},

    setUserCategoryProp: function setUserCategoryProp (uc) {this.userCategories = uc;  return this;},
    getUserCategoryProp: function getUserCategoryProp () {return this.userCategories;},

    setNameQualifier: function setNameQualifier (q) {
            this.nameQualifier = q;
            this.chklistname = this.chklistname + "|" + q;
            return this;
    },
    getNameQualifier: function getNameQualifier () { return this.nameQualifier;},

    // setChklistnamePart2: function setChklistnameNamePart2 (clnamep2) {this.chklistname_part2 = clnamep2;},
    // getChklistnamePart2: function getChklistnameNamePart2 () {return this.chklistname_part2;},

    getTotalTasks: function getTotalTasks() { console.log("Calculated at run-time for dashboard") },
    getNumTasksOverdue: function getTasksOverdue() { console.log("Calculated at run-time for dashboard") },
    getNumTasksDueToday: function getNumTasksDueToday()  { console.log("Calculated at run-time for dashboard") },
    getNumTasksDueThisWk: function getNumTasksDueThisWk()  { console.log("Calculated at run-time for dashboard") },
    getNumTasksUpcoming: function getNumTasksUpcoming() { console.log("Calculated at run-time for dashboard") },
    getTasksDone: function getTasksDone() { console.log("Calculated at run-time for dashboard"); },
    getNumCategories: function getNumCategories() { console.log("Calculated at run-time for dashboard"); },
    getTasksIgnored: function getTasksIgnored(tasksignored) { console.log("Calculated at run-time for dashboard") },


    insertTaskDetailRecord: function insertTaskDetailRecord (taskName, theCategory) {
        var newAssetId = dbtools.getNewAssetId();
        var category   = theCategory;
        this.saveToClipboard("asset_id", newAssetId);
        this.saveToClipboard("task_category", category);
        var putValues = {
             "userid":         this.userid,
             "assetid":        newAssetId,
             "taskname":       taskName,
             "taskstatus":     "not_started",
             "dueDate":        dpbutils.currentDateTimestamp("9999-09-09"),
             "hide_dones":     false,
             "chklist_assetid": this.assetid,
             "appcode":        this.appcode,
             "datadomain":     this.datadomain,
             "createDate":     dpbutils.currentDateTimestamp(),
             "updDate":        dpbutils.currentDateTimestamp()
        };
        var db_puter  = new dbtools.DbPutItem(BoConfig.taskTable, putValues);
        return db_puter.executeDbRequest();
    },

    // Note that deleteTask is a multispte procedure
    // Step1: get exist userCategories for this Checklist
    // Step2: delete task from userCategories
    // Step3: delete task from task table
    // Step4: update checklist table with updated userCateories Object
    deleteTask: function deleteTask(assetid, categoryName) {
       var self = this;
       this.getUserCategoriesFromTbl().then(function(data) {   // Step 1
            if (db_query.hasResultSet(data)) {
              if (data.Count === 1) {
                // console.log(JSON.stringify(data.Items[0].userCategories, null, 2));
                self.setUserCategoryProp(data.Items[0].userCategories);
                console.log(data.Items[0]);
                return self.deleteTaskFromTable(assetid, categoryName); // Step 2 and 3
              } else {
                if (data.Count === 0) {
                  return Promise.resolve("No records found");
                } else {
                  if  (data.Count > 1 ) {
                      throw Error(dpbutils.errorMsg.getErrMsg("DBCountError" , "1 item instead received " + data.Count))
                  }
                }
              }
            }
            // dpbutils.loginfo(`'${thisFilename}' Ended`);
          }).then(function(data) {      // result from step 3
            if (data === "No records found") {
                dpbutils.logerror("No record found for Checklist " + self.chklistname);
            } else {
                // var user_categories = self.getUserCategoryProp();
                return self.updCklsTableWithUserCat();  // Step 4
            }
            dpbutils.loginfo(`'${thisFilename}' Ended`);
         }).catch(function(err) {
            dpbutils.errorHandler(err, thisFilename, "Delete Task procecudure " , "");
         });
    },

    updateTaskName: function updateTaskName(oldTaskName, newTaskName, theCategory) {
        var self = this;
        return new Promise (function resolver(resolve, reject) {
            self.getUserCategoriesFromTbl().then(function(data) {   // Step 1
               if (db_query.hasResultSet(data)) {
                 if (data.Count === 1) {
                   self.setUserCategoryProp(data.Items[0].userCategories);
                   var foundCategory = self.getCategory(theCategory);
                   if (foundCategory) {
                       var updatePosition = _.findIndex(foundCategory.tasklist, function (o) { return o.taskname == oldTaskName;} );
                       if (updatePosition > -1) {
                           self.saveToClipboard("taskid_to_update", foundCategory.tasklist[updatePosition].taskid);
                           foundCategory.tasklist[updatePosition].taskname = newTaskName;
                          //  debugger;
                           return self.updCklsTableWithUserCat(); // Step 2 and 3
                       }
                       return Promise.resolve(`Task name not found executing updateTaskName method: "${self.userid}/${self.chklistname}/${theCategory}/${oldTaskName}"`)
                   } else {
                     return Promise.resolve(`Category not found executing updateTaskName method: "${self.userid}/${self.chklistname}/${theCategory}/${oldTaskName}"`)
                   }
                 } else {
                   if (data.Count === 0) {
                     return Promise.resolve(`Checklist not found executing updateTaskName method: "${self.userid}/${self.chklistname}/${theCategory}/${oldTaskName}"`);
                   } else {
                     if  (data.Count > 1 ) {
                         return Promise.resolve(dpbutils.errorMsg.getErrMsg("DBCountError" , `expected 1 item instead received" ${data.Count}
                           executing updateTaskName method for ${self.userid}/${self.chklistname}/${theCategory}/${oldTaskName}"`));
                     }
                   }
                 }
               }
               // dpbutils.loginfo(`'${thisFilename}' Ended`);
            }).then (function (data) {
                 if (_.isEmpty(data)) {  // If empty, updCklsTableWithUserCat completed
                      //  resolve("successful");
                      var taskIdToUpdate = self.getFromClipboard("taskid_to_update");
                      return self.updTaskNameInTaskTable(taskIdToUpdate, newTaskName);
                 } else  {
                      return Promise.resolve(data);    // Propagate to client
                 }
            }).then
               (function (data) {
                  if (_.isEmpty(data)) {  // If empty, updCklsTableWithUserCat completed
                     resolve("successful");
                     var taskIdToUpdate = self.getFromClipboard("taskid_to_update");
                     return self.updTaskNameInTaskTable(taskIdToUpdate, newTaskName);
                  } else if (data.startsWith('Category') || data.startsWith('Checklist') || data.startsWith('DBCountError') || data.startsWith('Task')) {
                     resolve(data);    // It is a promise error that was Propagated down
                  } else {   // otherwise this is error from  updTaskNameInTaskTable
                     resolve(`UpdateTaskname function failed while trying to update taskDetails table:from-name: ${oldTaskName} to-name: ${newTaskname} , category:${theCategory}`)
                  }
               },
               function (err) {
                    dpbutils.errorHandler(err, thisFilename, `updateTaskName failed: "${self.userid}/${self.chklistname}/${theCategory}/${oldTaskName}" `);
               }) // end of last then
        }) // end of out of promise promise
    },  // end of updateTaskName function

    updTaskNameInTaskTable: function updTaskNameInTaskTable (taskidToUpdate, newTaskName) {
      db_updater = new dbtools.DbUpdateItem()
          .setTableName(BoConfig.taskTable)
          .setPrimaryKey("userid", this.userid)
          .setSortKey("assetid",taskidToUpdate)
          .updateAttrib("taskname").withValue(newTaskName);
      // Execute database call
      return db_updater.executeDbRequest();
    },

    deleteTaskFromTable: function deleteTaskFromTable (asset_id, theCategoryName) {
      // var category_object = this.getCategory(theCategoryName);
      this.deleteTaskIdFrom(asset_id, theCategoryName);
      // Delete AssetId from Task table
      var db_deleter = new dbtools.DbDeleteItem()
          .setTableName(BoConfig.taskTable)
          .setPrimaryKey("userid", this.userid)
          .setSortKey("assetid",asset_id);
         // Execute database call
      return db_deleter.executeDbRequest();
    },


    isCklsInTable: function isCklsInTable () {
        if (this.userid.length === 0 && this.chklistname === 0) {
          throw Error(dpbutils.errorMsg.getErrMsg("MissingParms", " either userid or chklistname"))
        }

        db_query = new dbtools.DbQuery()
          .setTableName(BoConfig.cklsTable)
          .selectItemsWherePrimaryKey("userid").is("=").theValue(this.userid)
          .theSortKey("chklistname").is("=").theValue(this.chklistname)
          .returnOnly("userid, chklistname");   // projection expression; list of attributes
        // Execute database query to check if record exists
        return db_query.executeDbRequest();
    },  // end of isItemInTable

    // ========================================================================
    //  ADD NEW LEVEL 1 CATEGORY OR NEW SUBCATEGORY
    // ========================================================================
    // Note: addCategory supports 3 levels at this time, but can easily be exteneded to suport more.
    // To extend, consider making changes to getCategory to be to find category below 3 levels.
    addCategory: function addCategory(catPath) {
       if (catPath.indexOf("/") === -1) {  // adding single name to level 1
           this.addLevel1Category(catPath);
       } else {                         // else there multiple levels, hence adding subcategory
           this.addSubCategory(catPath);
       }
    },

    addLevel1Category: function addLevel1Category(newCategory) {
        this.addToParentCatList(this.userCategories, newCategory);  // parent here is main category list
    },

    addSubCategory: function addSubCategory(thePath) {
       // Split path name and pull out the subcategory
       var nameParts = thePath.split("/");             // split path into parts
       var theSubCategory = nameParts[nameParts.length - 1] // last item is subcategory
       // Get the subcategory's parent path
       nameParts.pop();
       if (nameParts.length > 1) {
         var parentPath = nameParts.join("/");
       } else  {
         var parentPath = nameParts.join("");
       }
       // Get the subcategory's parent using the parent's path
       var parentObject = this.getCategory(parentPath);
       // Add new subcatgory object to the parents category list
       if (parentObject) {
          this.addToParentCatList(parentObject.categoryList, theSubCategory, thePath);
       } else {
          throw Error(`"addSubCategory" function failed to add Category: "${thePath}". Check names in path.`);
       }
     },

     // ========================================================================
     //  FUNCTIONS USED TO TRAVERSE THE USER CATEGORIES
     // ========================================================================
     // Note that traversal happens recursively, hence these functions can support
     // levels beyond the 3 level limit of getCategory. So if you add more level of
     // categories, these functions should work "as-is";
     traverseCategories: function traverseCategories() {
       // process toplevel checklist tasks
       this.userCategories.forEach( (item) => {
        //  console.log(">> CATEGORY " + JSON.stringify(item.category, null,2 ));
        //  console.log(">> CATEGORY " + JSON.stringify(item, null,2 ));
         // console.log("THIS IS AN tasklist " + JSON.stringify(item.tasklist, null,2 ));
         if (this.hasElements(item.tasklist)) {
             this.processTaskList(item.category, item.path, item.tasklist);
         } /*else {  // Has no tasks, but lets display the category
           console.log(`Category: ${item.category} | Path: ${item.path}`);
         }*/
         if (this.hasElements(item.categoryList)) {
            this.processSubCategories(item.categoryList);
         }
        //  // If category has no taskids or subcategories; display the category
        //  if ((!this.hasElements(item.tasklist)) && (!this.hasElements(item.categoryList))) {
        //     console.log(`Category: ${item.category} | Path: ${item.path}`);
        //  }
       });
     },

     processTaskList: function processTaskList (category, path, taskArray) {
      //  console.log(`Category: ${category} | Path: ${path}`);
       taskArray.forEach ( ( taskid ) => {
         console.log(taskid);
       });
     },

     processSubCategories: function processSubCategories (subCategoryList) {
       // console.log(`Category: ${category} | Path: ${path}`);
       subCategoryList.forEach ( ( subcat ) => {
         // traverseCategories(subcat);
         console.log(`>> SubCategory: ${subcat.category} | Path: ${subcat.path}`);
         if (this.hasElements(subcat.tasklist)) {
            this.processTaskList(subcat.category, subcat.path, subcat.tasklist);
         }

         if (this.hasElements(subcat.categoryList)) {
           //  console.log(item.categoryList);
           this.processSubCategories(subcat.categoryList);
         }
       });
     },

     // ========================================================================
     //  ADDING SINGLE TASKID or ARRAY OF TASKIDS TO CATEGORY AND/OR SUBCATEGORY
     // (depending on path)
     // ========================================================================
     addTaskObjTo: function addTaskObjTo(taskObj, catPath)  {
        var categoryObject = this.getCategory(catPath);
        if (categoryObject) {
            categoryObject.tasklist.push(taskObj);
        } else {
            throw Error(`"AddTaskIdTo" failed to add taskid:"${taskObj}" to category "${catPath}"`)
        }
     },

     addTaskObjsTo: function addTaskIdsTo(taskObjArray, theCategory) {
        var categoryObject = this.getCategory(theCategory);
        if (categoryObject) {
          categoryObject.tasklist = categoryObject.tasklist.concat(taskObjArray);
        } else {
            throw Error(`"AddTaskIdTo" failed to add taskObj(s):"${taskObjArray.join(",")}" to category "${theCategory}"`)
        }
     },

     // ========================================================================
     //  DETELE TASKID(S) FROM A CATEGORY
     // ========================================================================

     deleteTaskIdFrom: function deleteTaskIdFrom(theTaskid, theCategoryName) {
       var categoryObject = this.getCategory(theCategoryName);
       if (categoryObject) {
         var deletePosition = _.findIndex(categoryObject.tasklist, {"taskid": theTaskid})
         _.pullAt(categoryObject.tasklist, [deletePosition]); // delete taskid
       } else {
         throw Error(`Could not delete taskid:${theTaskid} from  category:${theCategoryName}.`);
       }
     },

     deleteTaskNameFrom: function deleteTaskNameFrom(theTaskName, theCategoryName) {
       var categoryObject = this.getCategory(theCategoryName);
       if (categoryObject) {
         var deletePosition = _.findIndex(categoryObject.tasklist, {"taskname": theTaskName})
         _.pullAt(categoryObject.tasklist, [deletePosition]); // delete taskid
         debugger;
       } else {
         throw Error(`Could not delete task name :${theTaskName} from  category:${theCategoryName}.`);
       }
     },


     deleteTaskIdsFrom: function deleteTaskIdsFrom(taskObjArray, theCategoryName) {
       var categoryObject = this.getCategory(theCategoryName);
       if (categoryObject) {
         _.pullAll(categoryObject.tasklist, taskObjArray); // delete taskid
       } else {
         throw Error(`Could delete taskid(s) "${taskObjArray}" from category "${theCategoryName}".`)
       }
     },

     // ========================================================================
     //  MOVE TASK FUNCTIONS
     // ========================================================================

     saveToClipboard: function saveToClipboard (name, value) {
       this.clipboard[name] = value;
     },

     getFromClipboard: function getFromClipboard (name) {
       return this.clipboard[name];
     },

     moveTaskNameFrom: function moveTaskNameFrom(theTaskName, fromCategory) {

        var fromCat = this.getCategory(fromCategory);  // find from category

        if (fromCat) {
          // find taskObject by taskname
          var deletePosition = _.findIndex(fromCat.tasklist, {"taskname": theTaskName});
          if (deletePosition > -1) {
                var taskObjToMove = {"taskname": fromCat.tasklist[deletePosition].taskname,
                                     "taskid":   fromCat.tasklist[deletePosition].taskid };
                this.saveToClipboard("taskobj_to_move", taskObjToMove);   // save copy of taskObj to clipboard
                _.pullAt(fromCat.tasklist, [deletePosition]); // delete taskid
          }
        }
        if ((!fromCat) || (deletePosition === -1)) {
          throw Error(`Process to moveTaskNameFrom task name "${theTaskName}" from category "${fromCategory}" failed`);
        }
        return this;
     },

     toCategory: function toCategory(toCategory, directive, referenceTaskName) {
        // note diretives are "before" and "after"
        var idxOffset = directive === "after" ? 1 : 0;
        var toCat = this.getCategory(toCategory);
        if (toCat) {
          var insertPosition = _.findIndex(toCat.tasklist, {"taskname": referenceTaskName}) + idxOffset;
          if (insertPosition > -1) {
              var taskObjToMove = this.getFromClipboard("taskobj_to_move"); // get the from taskObj from clipboard
              toCat.tasklist.splice(insertPosition, 0, taskObjToMove);    // insert task object into target category/position
              }
          // toCat.tasklist = tasklist;
        }
        if ((!toCat) || (insertPosition === -1)) {
          throw Error(`Process to move taskname "${taskObjToMove.taskname}" to category "${toCategory}" failed`);
        }
     },

     // ========================================================================
     //  CHECKLIST TABLE FUNCTIONS
     // ========================================================================

     updCklsTableWithUserCat: function updCklsTableWithUserCat() {

       db_updater = new dbtools.DbUpdateItem()
           .setTableName(BoConfig.cklsTable)
           .setPrimaryKey("userid", this.userid)
           .setSortKey("chklistname",this.chklistname)
           .updateAttrib("userCategories").withValue(this.userCategories);
       // Execute database call
       return db_updater.executeDbRequest();

     },

     insertCheckListItem: function insertCheckListItem () {
         var putValues = {
              "userid":         this.userid,
              "chklistname":    this.chklistname,
              "userCategories": this.userCategories,
              "clstatus":       this.clstatus,
              "hide_dones":     this.hide_dones,
              "clmetrics":      this.clmetrics,
              "assetid":        dbtools.getNewAssetId(),
              "appcode":        this.appcode,
              "datadomain":     this.datadomain,
              "category":       this.category,
              "createDate":     dpbutils.currentDateTimestamp(),
              "updDate":        dpbutils.currentDateTimestamp()
         };
         var db_puter  = new dbtools.DbPutItem(BoConfig.cklsTable, putValues);
         return db_puter.executeDbRequest();
    },

    createNewChecklist: function createNewChecklist() {
      var self = this;
      var chklistPromise = new Promise( function resolver(resolve, reject) {
          self.isCklsInTable().then(
            function(data) {
                if ((data.Count === 0)) {
                  return self.insertCheckListItem();
                } else {
                    if (data.Count > 0) {
                      var msgExtension = `found in "createNewChecklist" for userid:${this.userid} with Checklistname:${this.chklistname} `
                      var errData = dpbutils.getErrMsg("DuplicateRecord", msgExtension);
                      return Promise.resolve(errData)
                    }
                }
            }
          ).then(
            function (data) {
                 if (_.isEmpty(data)) {
                     resolve("successful")
                 } else if  (data.search(/DuplicateRecord/ > -1)) {
                     resolve(data);
                 }
            },
            function (err) {
                dpbutils.logerr(err);
            }
         );
      });  // end of new Promise
      return chklistPromise;
    },

     // ========================================================================
     //  TASK TABLE FUNCTIONS
     // ========================================================================
     /*
      //Create New task
      Step1: get userCaterories from checklist table
      Step2: insert task into task table
      Step3: insert task into userCategories object
      Step4: use task aid, to update userCategories in Checklist table
     */
     getUserCategoriesFromTbl: function getUserCategoriesFromTbl() {
         db_query = new dbtools.DbQuery()
          .setTableName(BoConfig.cklsTable)
          .selectItemsWherePrimaryKey("userid").is("=").theValue(this.userid)
          .theSortKey("chklistname").is("=").theValue(this.chklistname)
          .returnOnly("userid, chklistname, userCategories, assetid");   // projection expression; list of attributes
          // Execute database call
          return db_query.executeDbRequest();
     },


    // Note addTask does a number of operations which amounts to 1 RCU and 2 WCU
    // Step1: get userCaterories from checklist table
    // Step2: insert new taskname in database
    // Step3: use task assetid to insert task into userCategories object
    // Step4: update userCategories in Checklist table
    // Also note that addTask, is idempotent. If you execute more than once,
    // it will not add a duplicate task;
     addTask: function addTask(taskname, taskCategoryName) {
        var self = this;
        if (taskCategoryName == undefined) {taskCategoryName = "_root_";}
        this.saveToClipboard("task_name", taskname);
        this.saveToClipboard("task_category", taskCategoryName);
        var promise = new Promise (function resolver(resolve, reject) {
        // return new Promise (function resolver(resolve, reject) {
          self.getUserCategoriesFromTbl().then(function (data) {   // Step 1
               if (!_.isEmpty(data) && data.Count === 1) {  // successfully retrieved UserCateories; do insert
                   self.setUserCategoryProp(data.Items[0].userCategories);  // save user categories in object property
                   self.assetid = data.Items[0].assetid;
                   var taskname = self.getFromClipboard("task_name");
                   var taskCategoryName = self.getFromClipboard("task_category");
                   // Make idempotent; do insert another task if addTask is run more than once
                   if (self.isTaskNameInCategory(taskname, taskCategoryName)) {
                     return Promise.resolve("Task Exist");
                   } else {
                     return self.insertTaskDetailRecord(taskname, taskCategoryName); // Step 2- gens new assetid and also saves task_category in clipboard
                   }
               } else {
                   if (data.Count === 0) {
                      var msgExtension = "Checklist:"+self.chklistname  + " userid:"+self.userid;
                      var errData = dpbutils.getErrMsg("NoRecordsFound", msgExtension);
                      return Promise.resolve(errData);
                   }
                   if  (data.Count > 1 ) {
                      var msgExtension = "Expected count:1" + " Received count:"+ data.Count + " Checklist:"+self.chklistname +
                             " userid:"+self.userid + " taskname:"+ self.getFromClipboard("task_name");
                      var errData = dpbutils.getErrMsg("NotSingleton", msgExtension);
                      // throw Error(errData);
                      return Promise.resolve(errData);
                   }
               }
            } // end then funnction data
          ).then(
              function(data) {
                  if (_.isEmpty(data)) {  // insert task completed succesfully; do update
                        var task_category = self.getFromClipboard("task_category");
                        var user_categories = self.getUserCategoryProp();
                        var asset_id = self.getFromClipboard("asset_id");
                        var taskname = self.getFromClipboard("task_name");   // N E W
                        self.addTaskObjTo({"taskid": asset_id, "taskname": taskname}, task_category);  // Step 3
                        return self.updCklsTableWithUserCat();  // Step 4
                  // Insert did not complete succesfully; test why below
                  } else if (data === "Task Exist") {
                         return Promise.resolve(data);    // Propagate to client
                  } else if (data.search(/NoRecordsFound:/i) > -1) {
                         return Promise.resolve(data);    // Propagate to client
                  } else if (data.search(/NotSingleton/i) > -1) {
                         return Promise.resolve(data);
                  } else  { // insert failed for some unknown reason
                     var asset_id = self.getFromClipboard("asset_id");
                     var msgExtension = 'during "addTask" for ' + ' user:'+self.userid +
                           ' checklistname:'+this.chklistname +  ' assetid:'+asset_id;
                     var errData = dpbutils.errorMsg.getErrMsg("SystemException", msgExtension);
                     throw Error(errData);
                 }
              } // end of function(data)
          ).then
              (function (data) {
                 if (_.isEmpty(data)) {  // If empty, updCklsTableWithUserCat completed
                       resolve("successful");
                 } else if (data === "Task Exist") {
                      resolve(data);    // Propagate to client
                 } else if (data.search(/NoRecordsFound:/i) > -1) {
                      resolve(data);    // Propagate to client
                 } else if (data.search(/NotSingleton/i) > -1) {
                      resolve(data);    // Propagate to client
                 }
              },
              function (err) {
                 dpbutils.logerror(err);
              }
         );
      }); // outter of  return promise
      return promise;
   },

     // ========================================================================
     //  SUPPORT FUNCTIONS
     // ========================================================================
     // Returns category object for Level 1,2, and 3 categories only. Would need
     // to be modified to support more than 3 levels.
     getCategory: function getCategory(theCategoryName) {  //Note: category name needs to be a path
        if (String(theCategoryName).indexOf("/") === -1)  {  // theCategoryName is not a path

            return _.find(this.userCategories,  { 'category': theCategoryName }); // return category from level 1

       } else {    // theCategoryName is a path, hence category must be in level 2 or 3

            // Split path name and pull out the level 1 cat name, the subcategory, and the subcat parent
            var nameParts = theCategoryName.split("/");             // split path into parts
            var numLevels = nameParts.length;
            var level1CatName = nameParts[0];             // 1st item in path is level 1 main category
            var theSubCatName = nameParts[nameParts.length - 1] // last item in path is subcategory
            // Get the parent idx  and parent name for the subcategory
            // var parentIdx = nameParts.length - 2;
            // var parentName = nameParts[nameParts.length - 2];  // get parent name of subcategory

            //If path has 2 levels, then I'm looking in level 2;
            if (numLevels === 2) {
              // get level 1 object first
              var level1Object = _.find(this.userCategories,  { 'category': level1CatName }); // get level 1
              // then search category list (level 2 ) of the level 1 category
              if (level1Object) {
                  // search for the subcategory in level 2 categoryList (the array )
                  var level2Object = _.find(level1Object.categoryList,  { 'category': theSubCatName });
                  return level2Object;  // found category name in level 2
              }
            }

            // If path has 3 levels, then I'm looking in level 3;
            if (numLevels === 3) {
              // get level 1 object first
              var level1Object = _.find(this.userCategories,  { 'category': level1CatName }); // get level 1
              // then search category list (level 2 ) of the level 1 category
              if (level1Object) {
                  // search for part 2 (idx=1) of the path name  in level 2 categoryList (the array )
                  var level2Object = _.find(level1Object.categoryList,  { 'category': nameParts[1] });
                  if (level2Object) { // if found, then search finally for the subcategory in level 3
                    var level3Object = _.find(level2Object.categoryList,  { 'category': theSubCatName });
                    // (level3Object) {
                      return level3Object;
                    // } else {
                      // return 0;
                    }
              }
            } // end of if (numlevels === 3 )
        } // end of first if/else
     },

      // Inserts new subcategory under parent
      addToParentCatList: function addToParentCatList(parentList, newCategory, path) {
        parentList.push(
             {
              category: newCategory,
              path: path || newCategory,  // for level 1 category, category and path will be the same
              tasklist: [],
              categoryList: []
             }
        );
      },

      isTaskNameInCategory: function isTaskNameInCategory(taskname, category) {
        var foundCategory = this.getCategory(category);
        var found = false;
        if (foundCategory) {
           var foundTaskname = _.find(foundCategory.tasklist, {'taskname': taskname});
           if (foundTaskname) {
             found = true;
           }
        }
        return found;
      },

      // Returns true if array has elements
      hasElements: function hasElements(tlarray) {
        return tlarray.length > 0 ? true : false;
      }
} /* end of prototype */


module.exports = {
  Checklist
}
