#!/usr/bin/env node
"use strick"
const fs = require('fs'); 
const https = require('https'); 
const { URL } = require('url');
const querystring = require("querystring");
const chalk = require("chalk");
const path = require("path");
var config = require('./lib/settings');
var inquirer =  require('inquirer-promise')

var basePath,  program

// path to the package install folder, or cwd if repl
// later.. I will  move to a module, where __filename is alway defined by wrapper function.
var basePath = (typeof __filename === 'undefined') ?  process.cwd() : path.dirname(fs.realpathSync(__filename));
var config = require('./lib/settings')


// Define the program options,  action-based sub-commands, and exec (serached for) sub-command.
var program = require('commander') 
 .version('0.1.0')
 .option('-u --url [url]', 'URL to OWF REST', config.baseUrl)
 .option('-c --cert [certFile]', 'Certificate',config.cert)
 .option('-C --ca [caFile]', 'Certificate Authorities File', config.ca)
 .option('-k --key [keyFile]', 'key file', config.cert)
 .option('-p --pw [keyPassword]', 'Password for key', config.passphrase)
 .option('-q --qsData <dataFile>', 'Query string Data parameter .i.e ?data={encoded-json-data-from-dataFile}')
 .option('-r --rbData <dataFile>', 'Request body from JSON dataFile')
 .option('-D --debug', 'Debug messages')

// action-based sub-commands
program.command('show')
   .description( "show progrm " )
   .action( function(options) { console.log("\n==\nprogram= ", program, '\n===\noptions = ',options); })

program.command('list')
  .description('List widgets')
  .action(function(options) {    
    owfRequest(program, 'GET', 'widget', null, null, options);
  })

program.command('update')
  .description('Update widget')
  .action(function(option) {
    if(program.debug) console.error(options);
    console.error('Sorry this command YTBD:')
    process.exit(1)
  })
  .option('-i --id <guid>', 'ID of widget')

 program.command('create')
  .description('Create widget')
  .action(function(options) {
    let data = null
    if(program.debug) console.error(options);
    if ( program.qsData ) {
       data = getData(program, program.qsData)
    }
    if ( program.rbData) {
      console.error(`ERROR: ${options.name()} Sorry rbData is not implemented yet, use  --qsData`)
      process.exit(1);
    } 
    if( ! data )  {
      console.error('ERROR: data required')
      process.exit(1)
    }    
    owfRequest(program, 'POST', 'widget', data, null, options);
 })
  .option('-w --widgetGuid <widgetGuid>', 'ID of widget' )
  .option('-g --groups <groups>', 'group', "OWF Users")

program.command('delete')
  .description('Delete widget')
  .action(function(options) {
    let data = null
    if ( program.qsData ) data = getData(program, program.qsData)
    if ( program.rbData) console.error(`ERROR: ${options.name()} Sorry rbData is not implemented yet, use  --qsData`)
    if( ! data )  {
      console.error('ERROR: data required')
      process.exit(1)
    }    
    owfRequest(program, 'DELETE', 'widget', data, null, options);
 })


program.command('test <cmd>')
  .description('Test [config], or the widget [create|delete] commands, using built-in data')
  .action( (cmd, options) => {
     var testData = require('./tests/testData.json');
     if (program.debug) console.log("read testData:", JSON.stringify(testData,null, 2) );
     switch(cmd) {
       case 'config' :
         console.log( JSON.stringify(config, null, 2))
         break;
       case 'create' :  
         owfRequest(program, 'POST', 'widget', testData.createWidgetData, null, options);
         //var qs = querystring.stringify({data: JSON.stringify(testData.createWidgetData)});
         //var u = new URL(`${program.url}/widget?${qs}`)
         //var httpOptions = requestOptions(u, 'POST');
         break;
       case 'delete' : 
         owfRequest(program, 'DELETE', 'widget', testData.deleteWidgetData, null, options);
         //var data = testData.deleteWidgetData
         //var rv = await doHttpRequest('POST', data, config.url, options);
         //var qs = querystring.stringify({data: JSON.stringify(testData.deleteWidgetData)});
         //var u = new URL(`${program.url}/widget?${qs}`)
         //var httpOptions = requestOptions(u, cmd);
         break;
       default :  
         console.error('Error unknown test cmd: ', cmd, '; Expecting [config|create|delete]');
         process.exit(1);
      }
  });

program.command('foobar', "Tryout commander exec subcommand.");


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
    res.on('data', (d) => { 
      //console.log(JSON.stringify(d, null, 2)); 
      process.stdout.write(d); 
    });
    //let error
    //if ( statusCode != 200 ) {
    //  error = new Error('Request Failed.\n' +
    //    `Status Code: ${statusCode}`);
    //  console.error( error.message )
    //}
  }); 

  req.on('error', (e) => {
    console.error(e);
    process.exit(1);
  });

  req.end()
}

// Run this script by invoking:  program.parse
// program.parse(["widget", "-q", "foo.json"]}
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
  if (program.id) jsonObj =  Object.assign( jsonObj, { id: program.id } )
  if (program.widgetGuid) jsonObj =  Object.assign( jsonObj, { widgetGuid: program.widgetGuid } )
  return jsonObj
}





