const _   = require("lodash");

const dpbutils = require("./../utils/dpbutils");
const dbtools  = require("./../dbutils/dbtools");
const schema   = require("./../dbutils/schema");  // Import table definitions

const BoConfig = {
  appcode:          "hmc",
  category:         "Home Maintenance",
  datadomain:       "ckls",
  cklsTable:        "HomeMaintChecklist",
  taskTable:        "HomeMaintTasks"
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
  this.appcode  = BoConfig.appcode;
  this.datadomain   = BoConfig.datadomain;
  this.category = BoConfig.category;
  this.createDate         = "";
  this.updDate            = "";
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


    insertTask: function insertTask (taskName, theCategory) {
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
                var user_categories = self.getUserCategoryProp();
                return self.updCklsTableWithUserCat(user_categories);  // Step 4
            }
            dpbutils.loginfo(`'${thisFilename}' Ended`);
        }).catch(function(err) {
            dpbutils.errorHandler(err, thisFilename, "Delete Task procecudure " , "");
        });

    },

    deleteTaskFromTable: function deleteTaskFromTable (asset_id, theCategoryName) {
      // var category_object = this.getCategory(theCategoryName);
      this.deleteTaskIdFrom(theCategoryName, asset_id);
      // Delete AssetId from Task table
      var db_deleter = new dbtools.DbDeleteItem()
          .setTableName(BoConfig.taskTable)
          .setPrimaryKey("userid", this.userid)
          .setSortKey("assetid",asset_id);
          // .whereAttribute("maxchecklists").is("=").toValue(3);
          // .whereAttributeNotExist("record_label")
          // .returnOldValues(false);
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
          // .theSortKey("SongTitle").matchPattern("begins_with").theValue("Today")
         // .where("appname").is("=").theValue("Home Maintenance Checklist")   // Filter Criteria
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
         console.log(`>> Category: ${item.category} | Path: ${item.path} `);
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
     addTaskIdTo: function addTaskIdTo(catPath, theTaskid) {
        var categoryObject = this.getCategory(catPath);
        if (categoryObject) {
            categoryObject.tasklist.push(theTaskid);
        } else {
            throw Error(`"AddTaskIdTo" failed to add taskid:"${theTaskid}" to category "${catPath}"`)
        }
     },

     addTaskIdsTo: function addTaskIdsTo(theCategory, taskidArray) {
        var categoryObject = this.getCategory(theCategory);
        if (categoryObject) {
          categoryObject.tasklist = categoryObject.tasklist.concat(taskidArray);
        } else {
            throw Error(`"AddTaskIdTo" failed to add taskid(s):"${taskidArray.join(",")}" to category "${theCategory}"`)
        }
     },

     // ========================================================================
     //  DETELE TASKID(S) FROM A CATEGORY
     // ========================================================================

     deleteTaskIdFrom: function deleteTaskIdFrom(theCategoryName, theTaskid) {
       var categoryObject = this.getCategory(theCategoryName);
       if (categoryObject) {
         _.pull(categoryObject.tasklist, theTaskid); // delete taskid
       } else {
         throw Error(`Could not delete taskid:${theTaskid} from  category:${theCategoryName}.`);
       }
     },

     deleteTaskIdsFrom: function deleteTaskIdsFrom(theCategoryName, taskidArray) {
       var categoryObject = this.getCategory(theCategoryName);
       if (categoryObject) {
         _.pullAll(categoryObject.tasklist, taskidArray); // delete taskid
       } else {
         throw Error(`Could delete taskid(s) "${taskidArray}" from category "${theCategoryName}".`)
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

     moveTaskIdFrom: function moveTaskIdFrom(fromCategory, fromTaskid) {

        this.saveToClipboard("taskid", fromTaskid);   // save from taskid to clipboard

        var fromCat = this.getCategory(fromCategory);  // find from category
        if (fromCat) {
          // this.saveToClipboard("fromCategory", fromCat);  // save from-category to clipboard
          _.pull(fromCat.tasklist, fromTaskid);   // delete taskid
        } else {  // category was not found
          throw Error(`Process to move taskid "${fromTaskid}" from category "${fromCategory}" failed`);
        }
        return this;
     },

     toCategory: function toCategory(toCategory, directive, referencePointTaskId) {
        // note diretives are "before" and "after"
        var idxOffset = directive === "after" ? 1 : 0;
        var toCat = this.getCategory(toCategory);
        if (toCat) {
          // var tasklist = toCat.tasklist; // get the tasklist array
          var insertPosition = toCat.tasklist.indexOf(referencePointTaskId) + idxOffset;
          var taskIdToMove = this.getFromClipboard("taskid"); // get the taskid to move from clipboard
          toCat.tasklist.splice(insertPosition, 0, taskIdToMove);
          // toCat.tasklist = tasklist;
        } else {
          throw Error(`Process to move taskid "${fromTaskid}" to category "${toCategory}" failed`);
        }
     },

     // ========================================================================
     //  CHECKLIST TABLE FUNCTIONS
     // ========================================================================

     updCklsTableWithUserCat: function updChecklistTable(userCategoryObject) {

       db_updater = new dbtools.DbUpdateItem()
           .setTableName(BoConfig.cklsTable)
           .setPrimaryKey("userid", this.userid)
           .setSortKey("chklistname",this.chklistname)
            // .incrementValueBy(1).forAttribute("lastChecklistId")
           .updateAttrib("userCategories").withValue(userCategoryObject);
           // .updateAttrib("lastChecklistId").withValue(747)
           // .onlyIf("lastChecklistId").is("=").theValue(3); // condition expression
          // console.log("DBUPDATER DBPARMS ", JSON.stringify(db_updater.parameter, null, 2 ));
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
           self.isCklsInTable().then(function(data) {
              if ((!_.isEmpty(data)) && (data.Count > 0)) {
                 reject("Data Exist");
              } else {
                 resolve (self.insertCheckListItem());
              }
           });/*.then((data) => {
               if (data === "Data Exist") {
                 dpbutils.logerror(`Checklist item ${self.chklistname} already exist in ${BoConfig.cklsTable} table. `);
                 throw Error("EEEEEEEEEEEEEEERRRRRRRRRRR")
               } else {
                 if (_.isEmpty(data)) {
                  dpbutils.loginfo(`Insert of ${self.chklistname} completed succesfully`);
                  resolve("successful")
                }
              }
           });/*.catch ((err) => {
                // dpbutils.errorHandler(err, thisFilename, `Put of new checklist item "${self.chklisname}" was unsucessful`, "");
                reject(`Data for ${self.chklistname} already exist in table`)
           });*/
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
          // .theSortKey("SongTitle").matchPattern("begins_with").theValue("Today")
          // .where("price").is("<").theValue("1.00");   // Filter Criteria
          .returnOnly("userid, chklistname, userCategories");   // projection expression; list of attributes
          // Execute database call
          return db_query.executeDbRequest();
     },

     // Note addTask function does a number of operations which amounts to 1 RCU and 2 WCU
     // Step1: get userCaterories from checklist table
     // Step2: insert new taskname in database
     // Step3: use task assetid to insert task into userCategories object
     // Step4: update userCategories in Checklist table
    //  addTask: function addTask(taskname, taskCategoryName) {
    //     var self = this;
    //     if (taskCategoryName == undefined) {taskCategoryName = "_root_";}
    //     this.getUserCategoriesFromTbl().then(function(data) {   // Step 1
    //        if (db_query.hasResultSet(data)) {
    //          if (data.Count === 1) {
    //            self.setUserCategoryProp(data.Items[0].userCategories);  // save user categories in object property
    //            return self.insertTask(taskname, taskCategoryName); // Step 2  - also saves task_category in clipboard
    //          } else {
    //            if (data.Count === 0) {
    //              return Promise.resolve("No records found");
    //            } else {
    //              if  (data.Count > 1 ) {
    //                  throw Error(dpbutils.errorMsg.getErrMsg("DBCountError" , "1 item instead received " + data.Count))
    //              }
    //            }
    //          }
    //        }
    //        // dpbutils.loginfo(`'${thisFilename}' Ended`);
    //     }).then(function(data) {
    //         var task_category = self.getFromClipboard("task_category");
    //         debugger;
    //         if (data === "No records found") {
    //           return Promise.resolve("No record found for Checklist: " + task_category);
    //         } else {   // Step2: insert task into task table
    //           if (_.isEmpty(data)) {
    //              var user_categories = self.getUserCategoryProp();
    //              var asset_id = self.getFromClipboard("asset_id");
    //              self.addTaskIdTo(task_category, asset_id);  // Step 3
    //              return self.updCklsTableWithUserCat(user_categories);  // Step 4
    //           }
    //        }
    //     }).then (function (data) {
    //        if (_.isEmpty(data)) {
    //          console.log("succesfully udpated");
    //        } else {
    //          dpbutils.logerror("BO method addTask encountered issue " + data);
    //        }
    //     }).catch(function(err) {
    //        // Call errorhandler with err object, this filename, the operationName, and Parms
    //        dpbutils.errorHandler(err, thisFilename, "BO method addTask ", "");
    //     });
    //  },

     addTask: function addTask(taskname, taskCategoryName) {
        self = this;
        if (taskCategoryName == undefined) {taskCategoryName = "_root_";}
        self.saveToClipboard("task_name", taskname);
        self.saveToClipboard("task_category", taskCategoryName);
        return new Promise (function resolver(resolve, reject) {
             self.getUserCategoriesFromTbl().then(function(data) {   // Step 1
                 if (!_.isEmpty(data) && data.Count === 1) {
                    self.setUserCategoryProp(data.Items[0].userCategories);  // save user categories in object property
                     var taskname = self.getFromClipboard("task_name");
                     var taskCategoryName = self.getFromClipboard("task_category");
                     return self.insertTask(taskname, taskCategoryName); // Step 2  - also saves task_category in clipboard
                 } else {
                     if (data.Count === 0) {
                       reject("No records found for " + self.chklistname);
                     }
                     if  (data.Count > 1 ) {
                       reject(dpbutils.errorMsg.getErrMsg("DBCountError" , "1 item instead received " + data.Count));
                     }
                 }
                 // dpbutils.loginfo(`'${thisFilename}' Ended`);
              }).then(function(data) {
                  // if (data === "No records found") {
                  //   return Promise.resolve("No record found for Checklist: " + task_category);
                  // } else {   // Step2: insert task into task table
                    if (_.isEmpty(data)) {
                       var task_category = self.getFromClipboard("task_category");
                       var user_categories = self.getUserCategoryProp();
                       var asset_id = self.getFromClipboard("asset_id");
                       self.addTaskIdTo(task_category, asset_id);  // Step 3
                       resolve(self.updCklsTableWithUserCat(user_categories));  // Step 4
                    }
                //  }
              })/*.then (function (data) {
                 if (_.isEmpty(data)) {
                   console.log("succesfully udpated");
                 } else {
                   dpbutils.logerror("BO method addTask encountered issue " + data);
                 }
              }).catch(function(err) {
                 // Call errorhandler with err object, this filename, the operationName, and Parms
                 dpbutils.errorHandler(err, thisFilename, "BO method addTask ", "");
              }); */
        });
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


      // Returns true if array has elements
      hasElements: function hasElements(tlarray) {
        return tlarray.length > 0 ? true : false;
      }
} /* end of prototype */




// hmc = new Checklist();
// hmc.setUser("db00004");
// hmc.set("Home Maintenance Checklist")
//    .setclnamePart2("Primary Residence");
// console.log(hmc);
// hmc.saveChklist();

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

module.exports = {
  Checklist
}
