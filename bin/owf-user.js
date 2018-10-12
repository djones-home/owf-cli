#!/usr/bin/env node
"use strick"
const fs = require('fs'); 
const https = require('https'); 
const { URL } = require('url');
const querystring = require("querystring");
const path = require("path");
var config = require('../lib/settings');
const package = require('../package')
const uuid = require('uuid')
const {tableOutput, validate} = require('../lib/user')
const {owfRequest} = require('../lib/owfRequest')

// Define the program options,  action-based sub-commands, and exec (serached for) sub-command.
var program = require('commander') 
 .version(package.version)
 .option('-u --url [url]', 'URL to OWF REST', config.baseUrl)
 .option('-c --cert [certFile]', 'Certificate',config.cert)
 .option('-C --ca [caFile]', 'Certificate Authorities File', config.ca)
 .option('-k --key [keyFile]', 'key file', config.cert)
 .option('-p --pw [keyPassword]', 'Password for key', config.passphrase)
 .option('-q --qsData <dataFile>', 'Query string Data parameter .i.e ?data={encoded-json-data-from-dataFile}')
 .option('-r --rbData <dataFile>', 'Request body from JSON dataFile')
 .option('-D --debug', 'Debug messages')
 .option('-o --output <type>', 'Table output', config.output || "json")

// action-based sub-commands
program.command('show')
   .description( "show internal-program object" )
   .action( function(options) { console.log("\n==\nprogram= ", program, '\n===\noptions = ',options); })

program.command('list')
  .description('List owf user')
  .action(function(options) {    
    owfRequest({program, restPath: 'user'})
    .then(data => { console.log( program.output != 'json' ? tableOutput(JSON.parse(data)) : data)
     })

  })

// Run this script by invoking:  program.parse
program.parse(process.argv);

function getData(program, filePath) {
  let jsonObj = JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
  //if (program.id) jsonObj =  Object.assign( jsonObj, { id: program.id } )
  //if (program.widgetGuid) jsonObj =  Object.assign( jsonObj, { widgetGuid: program.widgetGuid } )
  return jsonObj
}
