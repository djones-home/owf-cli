#!/usr/bin/env node
"use strick"
const fs = require('fs'); 
const { URL } = require('url');
const querystring = require("querystring");
const path = require("path");
var config = require('../lib/settings');
const {owfRequest} = require('../lib/owfRequest')
const package = require('../package')
const uuid = require('uuid')
const {tableOutput, validate, testcase, addGroup, getWidget } = require('../lib/widget')

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
 .option('-g --groups <groups>', 'group', config.groups || "OWF Users,OWF Administrators")
 .option('-o --output <type>', 'Table output', config.output || "json")

// action-based sub-commands
program.command('show')
   .description( "show internal-program object" )
   .action( function(options) { console.log("\n==\nprogram= ", program, '\n===\noptions = ',options); })

program.command('list')
  .description('List widgets')
  .action(function(options) {    
    owfRequest({program, restPath: 'widget'})
    .then(data => console.log( program.output != 'json' ? tableOutput(JSON.parse(data)) : data))
  })

program.command('update <filter>')
  .description('Update widget')
  .action(function(option) {
    if(program.debug) console.error(options);
    console.error('Sorry this command YTBD:')
    process.exit(1)
  })


 program.command('create')
  .description('Create widget')
  .action(function(options) {
    let data = null
    if(program.debug) console.error(options);
    if ( program.qsData ) {
       data = validate(program, getData(program, program.qsData))
       if(program.debug) console.error(JSON.stringify(data,null,2));

    }
    if ( program.rbData) {
      console.error(`ERROR: ${options.name()} Sorry rbData is not implemented yet, use  --qsData`)
      process.exit(1);
    }  
   // fs.writeFileSync('./jkCreateWidgetValidateData.json', JSON.stringify(data,null,2))
    if( ! data )  {
      console.error('ERROR: data required')
      process.exit(1)
    }    
    owfRequest({program, method: 'POST', restPath: 'widget', paramJson: data})
    .then(data => {
      console.log(data)
      program.groups.split(',').forEach( g => addGroup(program, g.trim(), JSON.parse(data).data[0].id))
    });
 })

 // dj@dj12:~/projects/owf-cli$ ./bin/owf.js widget delete Test
program.command('delete <filter>')
  .description('Delete widget selected by filter RegExp')
  .action(function(re, options) {
      let data = null
      getWidget(program, re).then( data => {
        if ( data.length != 1 ) { 
          console.error(`ERROR: Found ${data.length}, with widgetRegExp /${re}/ must resolve to One Widget name or id `)
          process.exit(1)
        }
        owfRequest({program, method: 'DELETE', restPath: 'widget', paramJson: data})
        .then(data => console.log(data));  
      })
  })

program.command('test <cmd>')
  .description('Test [config], or the widget [create|delete|whoami] commands, using built-in data')
  .action( (cmd, options) => {
     var testData = require('../tests/testData.json');
     if (program.debug) console.log("read testData:", JSON.stringify(testData,null, 2) );
     switch(cmd) {
       case 'validate': 
         testcase(program, null)
         break; 
       case 'create' :
         owfRequest({program, method: 'POST', restPath: 'widget', paramJson: testData.createWidgetData})
         .then(data => console.log(data));
         break;
       case 'delete' : 
         owfRequest({program, method: 'DELETE', restPath: 'widget', paramJson: testData.deleteWidgetData})
         .then(data => console.log(data));
         break;
       case 'whoami' :
         owfRequest({program, restPath: 'prefs/person/whoami'})
         .then(data => console.log(data));
         break;
      case 'doit' :
        var qs  = {
          "widget_id": "48141aaa-0417-49d7-8c20-1a1c3b138043",
          "tab": "groups",
          "update_action": "add",
          "data": JSON.stringify([{"name": "OWF Users", "id": 202 }])
        }
    
        owfRequest({program, method: 'PUT', restPath: `widget?${querystring.stringify(qs)}`} )
        .then(data => console.log(data))
        break;

      case 'showit' :
        owfRequest({program, restPath: 'widget?widgetGuid=48141aaa-0417-49d7-8c20-1a1c3b138043'})
        .then(data => console.log(data));
        break;
  

       default :  
         console.error('Error unknown test cmd: ', cmd, '; Expecting [validate|create|delete|whoami]');
         process.exit(1);
      }
  });

program.command('foobar', "Tryout commander exec subcommand.");




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





