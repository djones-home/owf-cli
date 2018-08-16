#!/usr/bin/env node
"use strick"
const fs = require('fs'); 
const https = require('https'); 
const { URL } = require('url');
const querystring = require("querystring");
const chalk = require("chalk");
const path = require("path");
var config = require('../lib/settings');
var inquirer =  require('inquirer-promise')
const package = require('../package')
const uuid = require('uuid')
const {tableOutput, validate} = require('../lib/widget')

var  program


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
 .option('-t --table', 'Table output')

// action-based sub-commands
program.command('show')
   .description( "show internal-program object" )
   .action( function(options) { console.log("\n==\nprogram= ", program, '\n===\noptions = ',options); })

program.command('list')
  .description('List owf groups')
  .action(function(options) {    
    owfRequest(program, 'GET', 'group', null, null, options);
  })



function owfRequest(program, method, restPath, paramJson, dataJson, options, headers) {
  var url = `${program.url}/${restPath}`
  if (paramJson)  url += `?${querystring.stringify({data: JSON.stringify(paramJson)})}`
  if (typeof headers === "undefined") headers = { 'content-type' : 'application/json' }
  if (typeof method === "undefined") method = "GET";
  let u = new URL(url)
  let httpOpts =  {
        method: method,
        path: u.pathname + u.search,
        ca: fs.readFileSync(program.ca), 
        key: fs.readFileSync(program.key),
        cert: fs.readFileSync(program.cert),
        passphrase: program.pw,
        hostname: u.hostname,
        port: u.port,
        headers: headers,
   }
  if (program.debug) console.log('DEBUG: requiestOptions:', httpOpts);
  var req = https.request(httpOpts, (res) => { 
    const { statusCode } = res;
    let body = []
    res.on('data', (chunk) => { 
      body.push(chunk)
    }).on('end', ()=> {
      body = Buffer.concat(body).toString();
      if (program.table) {
        body = tableOutput(JSON.parse(body))
      };
      process.stdout.write(body +"\n"); 
    })
    let error
    if ( statusCode != 200 ) {
      error = new Error('Request Failed.\n' +
        `Status Code: ${statusCode}`);
      console.error( error.message )
    }
  }); 

  req.on('error', (e) => {
    console.error(e);
    process.exit(1);
  });

  req.end()
}

// Run this script by invoking:  program.parse
program.parse(process.argv);

//    'content-length' : Buffer.byteLength(jsonObject, 'utf8'),

// newbe note: JS first pass discovers this function "getData", the behavior known as 'hoisting' makes known getData 
///  within the scope (in this case the scope is just inside __filename). This is a function definition.
//  A function definition, as apposed to a funtion expression, will be hoisted.
//  if you wrap the function in parenthesis, it becomes an expression, and expressions are processes on subsequent passes of the JS parse.
//  if you place the definition inside another enclosure, then hoisting is limited to the enclosure scope, as the first pass will does not
// evaluate the sub-scope definitions.
//  if assign the funtion to a variable, it is an expression function. Assignment are not evalutated until the code is executed.
function getData(program, filePath) {
  let jsonObj = JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
  //if (program.id) jsonObj =  Object.assign( jsonObj, { id: program.id } )
  //if (program.widgetGuid) jsonObj =  Object.assign( jsonObj, { widgetGuid: program.widgetGuid } )
  return jsonObj
}
