'use strict';
const path = require('path');
const _ = require('lodash');
const shell = require('shelljs');
const helpers = require('./helpers');

const args = process.argv;
const arr = (args[2] || '').split('/');
const featureName = _.kebabCase(arr[0]);
const actionName = _.kebabCase(arr[1]);
const actionType = _.snakeCase(args[3] || actionName).toUpperCase();
const camelActionName = _.camelCase(actionName);

if (!actionName) {
  throw new Error('Please specify the action name.');
}

const filesToSave = [];
const toSave = helpers.getToSave(filesToSave);

const targetDir = path.join(__dirname, `../src/features/${featureName}/redux`);

let targetPath;
let lines;

/* Update constants.js */
console.log('Updating constants.js');
targetPath = path.join(targetDir, 'constants.js');
lines = helpers.getLines(targetPath);
helpers.removeConstant(lines, actionType);
toSave(targetPath, lines);

/* Remove action file */
console.log('Removing action file');
targetPath = path.join(targetDir, `${camelActionName}.js`);
shell.rm(targetPath);

/* Update actions.js */
console.log('Updating actions.js');
targetPath = path.join(targetDir, 'actions.js');
lines = helpers.getLines(targetPath);
helpers.removeImportLine(lines, `./${camelActionName}`);
helpers.removeNamedExport(lines, camelActionName);
toSave(targetPath, lines);

/* Updating reducer.js */
console.log('Updating reducer.js');
targetPath = path.join(targetDir, 'reducer.js');
lines = helpers.getLines(targetPath);
helpers.removeImportLine(lines, `./${camelActionName}`);
helpers.removeNamedExport(lines, camelActionName);
toSave(targetPath, lines);

// save files
helpers.saveFiles(filesToSave);
console.log('Remove action success: ', actionName);

shell.exec(`"${process.execPath}" ${path.join(__dirname, 'rm_action_test.js')} ${featureName}/${actionName}`);
