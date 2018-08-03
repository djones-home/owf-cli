#!/usr/bin/env node
"use strick"
const fs = require('fs'); 
const https = require('https'); 
const { URL } = require('url');
const querystring = require("querystring");
const chalk = require("chalk");
const path = require("path");

path.basename(path.dirname(fs.realpathSync(__filename)));

// Default configuration settings.
var config =  {
  cert: `${process.env.HOME}/certs/admin.pem`,
  ca: `${process.env.HOME}/certs/ca-crt.pem`,
  pw: 'password', 
  url: 'https://ci10.ccs.nps.edu/owf', 
}

// Merge local settings
var settings = `${process.env.HOME}/.config/owf/config`
if ( fs.existsSync(`${settings}.json`) ) {
  config = Object.assign( config, require(settings));
}

// Define the 
//var program = require('commander') // This is good style. However, while debugging, I want to
// cut/paste into the node.js REPL, so shorten "program" to "p", and use " p." vs. chaining with " .".
var p = require('commander')
 .version('0.1.0')
 .option('-u --url [url]', 'URL to OWF REST', config.url)
 .option('-c --cert [certFile]', 'Certificate',config.cert)
 .option('-C --ca [caFile]', 'Certificate Authorities File', config.ca)
 .option('-k --key [keyFile]', 'key file', config.cert)
 .option('-p --pw [keyPassword]', 'Password for key', config.pw)
 .option('-q --qsData <dataFile>', 'Query string Data parameter .i.e ?data={encoded-json-data-from-dataFile}')
 .option('-r --rbData <dataFile>', 'Request body from JSON dataFile')
 .option('-D --debug', 'Debug messages')

 p.command('show')
   .description( "show progarm " )
   .action( function(options) { console.log(p); })

// Define sub-commands
 p.command('get')
  .alias('list')
  .description('List widgets')
  .action(function(options) {
    if(p.debug) console.error(options);
    // do_request('GET')
    do_request(options.name().toUpperCase())
  })
 .option('-i --id <guid>', 'ID of widget')

 p.command('put')
  .alias('update')
  .description('Update widget')
  .action(function(option) {
    if(p.debug) console.error(options);
    do_request('PUT')
  })
  .option('-i --id <guid>', 'ID of widget')

 p.command('post')
  .alias('create')
  .description('Create widget')
  .action(function(options) {
    if(p.debug) console.error(options);
    if (! p.qsData && ! p.rbData) {
      console.error(`ERROR: ${options.name()} command requires --qsData or --rbData`)
      process.exit(1);
    }
      do_request('POST')
 })
  .option('-i --id <guid>', 'ID of widget')

 p.command('delete')
  .description('Delete widget')
  .action(function(options) {
    if(p.debug) console.error(options);
    do_request('DELETE')
 })
  .option('-i --id <guid>', 'ID of widget')

p.parse(process.argv);
 p.command('test <cmd>')
  .description('Test widget [create|delete] using built-in data')
  .action(function(options) {
     if (typeof __filename === 'undefined') {
       var testData = require( path.join(process.cwd(), 'tests', 'testData'));
     } else {
       var testData = require( path.join(path.basename(path.dirname(fs.realpathSync(__filename)), 'tests', 'testData')));
     }
     switch(cmd) {
       case 'create' :  
       case 'post' :  
         var qs = querystring.stringify({data: JSON.stringify(testData.createWidgetData)});
         var httpMethod ='POST'
         break;
       case 'delete' : 
         var qs = querystring.stringify({data: JSON.stringify(testData.deleteWidgetData)});
         var httpMethod ='DETELE'
         break;
       default : { 
         console.error('Error unknown test cmd: ', httpMethod);
         process.exit(1);
       }
     }
     var u = new URL(`${p.url}?${qs}`)
     var httpOptions = requestOptions(u, cmd);
     var req = https.request(httpOptions, (res) => { 
       res.on('data', (d) => { 
         process.stdout.write(d); 
       }); 
     }); 
     req.on('error', (e) => {
       console.error(e);
       process.exit(1);
     });
     req.end()
  });

function requestOptions(u, method, headers ) {  
   if (typeof headers === "undefined") headers = { 'content-type' : 'application/json' }
   if (typeof method === "undefined") method = "GET";
   return {
        method: method,
        path: u.pathname + u.search,
        ca: fs.readFileSync(p.ca), 
        key: fs.readFileSync(p.key),
        cert: fs.readFileSync(p.cert),
        passphrase: p.pw,
        hostname: u.hostname,
        port: u.port,
        headers: headers,
   }
}

//    'content-length' : Buffer.byteLength(jsonObject, 'utf8'),

//function mergeOptionsData(filePath) {
function getData(filePath) {
  let jsonObj = JSON.parse(fs.readFileSync(filePath, 'utf8').trim());
  if (p.id) {
    jsonObj =  Object.assign( jsonObj, { id: p.id } )
  }
  return JSON.stringify(jsonObj)
}

function get_qs( ) {
  if(! p.qsData) retrun "";
  let data = getData(p.qsData);
  return `?${querystring.stringify({data: data})}`;
}
function do_request(cmd) {
  var u = new URL(`${p.url}/widget${get_qs()}`)
  if( p.rbData)   var body = getData(p.rbData) ;
  if (p.debug) console.error('reqOptions:', requestOptions(u,cmd));
  let req = https.request(requestOptions(u,cmd), (res) => { 
    if (p.debug) {
      console.error('STATUS: ', res.statusCode); 
      console.error('HEADERS: ', res.headers); 
    }
    res.on('data', (d) => { 
      process.stdout.write(d); 
    }); 
  });
  if (p.rbData) req.write(JSON.stringify(body));
  req.on('error', (e) => {
      console.error(e);
      process.exit(1);
  });
  req.end();
}



// Run it
// p.parse(["widget", "-q", "foo.json"]}
p.parse(process.argv);

