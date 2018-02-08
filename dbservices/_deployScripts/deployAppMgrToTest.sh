#!/bin/bash
space=" "
baseDir="../../"
targetDir=$basedir/dbservices/_deployScripts
srcTablename="AppSettings"
trgTablename="AppSettings-test"
srcFuncname="AppManager.js"
trgFuncname="AppManager-test.js"

lambdaFunctionName="apmCreateAppSettings"
lambdaFileSuffix="-test.js"
lambdaHandlerSuffix="-test"

echo ">>> Copy dependency files needed"
# *************************************************************
# Copy dependency files needed for App Manager.
# *************************************************************
# Node modules -- additional modules needed
# note that aws-sdk node module is included with lambda
cp -r $baseDir/node_modules/lodash   $baseDir$targetDir/node_modules
cp -r $baseDir/node_modules/moment   $baseDir$targetDir/node_modules
cp -r $baseDir/node_modules/moment-timezone   $baseDir$targetDir/node_modules
cp -r $baseDir/node_modules/uuid     $baseDir$targetDir/node_modules

# Used by dpbutils
cp $baseDir/dbservices/utils/dpbutils.js    $baseDir$targetDir/dpbutils.js

# Used by dbtools
cp $baseDir/dbservices/dbutils/dbtools.js   $baseDir$targetDir/dbtools.js
cp $baseDir/dbservices/dbutils/aws.js       $baseDir$targetDir/aws.js

# Copy App Manager Business Object and App Mananger client functions
cp $baseDir/dbservices/bo/AppManager.js       $baseDir$targetDir/AppManager.js
cp $baseDir/dbservices/boClient/apmCreateAppSettings.js  $baseDir$targetDir/apmCreateAppSettings-test.js

# Copy package.json-test to package.json
cp $baseDir/package.json-test       $baseDir$targetDir/package.json

echo ">>> Make source file changes"
# *************************************************************
# Make source file changes to conform to lambda packaging
# *************************************************************

# Make changes to AppManager
sed "s/.\/..\/utils\/dpbutils/.\/dpbutils/" $baseDir$targetDir/AppManager.js > AppManager.js-new
rm AppManager.js
mv AppManager.js-new AppManager.js

sed "s/.\/..\/dbutils\/dbtools/.\/dbtools/" $baseDir$targetDir/AppManager.js > AppManager.js-new
rm AppManager.js
mv AppManager.js-new AppManager.js

sed "s/AppSettings/AppSettings-test/" $baseDir$targetDir/AppManager.js > AppManager.js-new
rm AppManager.js
mv AppManager.js-new AppManager.js

sed "s/\/\/Used-For-AWS //g" $baseDir$targetDir/AppManager.js > AppManager.js-new
rm AppManager.js
mv AppManager.js-new AppManager.js

sed  's/platform = "local"/platform = "aws"/' $baseDir$targetDir/AppManager.js > AppManager.js-new
rm AppManager.js
mv AppManager.js-new AppManager.js


# Make changes to apmCreateAppSettings client
sed "s/.\/..\/utils\/dpbutils/.\/dpbutils/" $baseDir$targetDir/apmCreateAppSettings-test.js > apmCreateAppSettings-test.js-new
rm apmCreateAppSettings-test.js
mv apmCreateAppSettings-test.js-new apmCreateAppSettings-test.js

sed "s/.\/..\/dbutils\/dbtools/.\/dbtools/" $baseDir$targetDir/apmCreateAppSettings-test.js > apmCreateAppSettings-test.js-new
rm apmCreateAppSettings-test.js
mv apmCreateAppSettings-test.js-new apmCreateAppSettings-test.js

sed "s/.\/..\/bo\/AppManager/.\/AppManager/" $baseDir$targetDir/apmCreateAppSettings-test.js > apmCreateAppSettings-test.js-new
rm apmCreateAppSettings-test.js
mv apmCreateAppSettings-test.js-new apmCreateAppSettings-test.js

sed "s/AppSettings/AppSettings-test/" $baseDir$targetDir/apmCreateAppSettings-test.js > apmCreateAppSettings-test.js-new
rm apmCreateAppSettings-test.js
mv apmCreateAppSettings-test.js-new apmCreateAppSettings-test.js

sed "s/\/\/comment //" $baseDir$targetDir/apmCreateAppSettings-test.js > apmCreateAppSettings-test.js-new
rm apmCreateAppSettings-test.js
mv apmCreateAppSettings-test.js-new apmCreateAppSettings-test.js

# Make changes to dbtools.js
sed "/Used-For-Local/d" $baseDir$targetDir/dbtools.js > dbtools.js-new
rm dbtools.js
mv dbtools.js-new dbtools.js

sed "s/\/\/Used-For-AWS //g" $baseDir$targetDir/dbtools.js > dbtools.js-new
rm dbtools.js
mv dbtools.js-new dbtools.js

# # *************************************************************
# # Package zip file
# # *************************************************************
echo ">>> Package Zip file of all depenencies"
# List files you would like to include in your lambda zip package

lambdaFile=$lambdaFunctionName$lambdaFileSuffix
zipFile=$lambdaFunctionName".zip"

# echo `zip -r $zipFile node_modules $f2 $f3 $f4 $f5 $f6 $f7 $f8 $lambdaFile`
echo `zip -r -q $zipFile .`
#
# # # # *************************************************************
# # # # copy zip file to S3 test bucket
# # # # *************************************************************
# # # echo `aws s3 cp $zipFile s3://dpbsw-hmc-test`
# #
# # echo ">>> Delete Lambda Function " $lambdaFunctionName
# # *************************************************************
# # Delete (cleanup) previous version of the Lambda Function
# # *************************************************************
deleteFunctionCmd='aws lambda delete-function '
deleteFunctionCmd+='--function-name '
deleteFunctionCmd+=$lambdaFunctionName$space
deleteFunctionCmd+='--region us-east-1 '
deleteFunctionCmd+='--profile dborges '
#
echo `$deleteFunctionCmd`
#
echo ">>> Create Lambda Function "$lambdaFunctionName
# # # *************************************************************
# # # Create New Lambda Function
# # # *************************************************************
lambdaHandlerName=$lambdaFunctionName$lambdaHandlerSuffix

createFunctionCmd='aws lambda create-function '
createFunctionCmd+='--region us-east-1 '
createFunctionCmd+='--function-name '$lambdaFunctionName$space
createFunctionCmd+='--zip-file fileb://'$zipFile$space
createFunctionCmd+='--role arn:aws:iam::105608920741:role/LambdaExecutionRole '
createFunctionCmd+='--handler '$lambdaHandlerName".handler"$space
createFunctionCmd+='--runtime nodejs6.10 '
createFunctionCmd+='--profile dborges '
# #
echo `$createFunctionCmd`

# # *************************************************************
# # Delete all dependent files
# # *************************************************************
# # echo ">>> Clean up all dependent files from directory"
# # rm -r node_modules
# # rm apmCreateAppSettings-test.js
# # rm apmCreateAppSettings.zip
# # rm AppManager.js
# # rm aws.js
# # rm dbtools.js
# # rm dpbutils.js
# # rm package.json
