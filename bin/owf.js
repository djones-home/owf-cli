#!/usr/bin/env node
"use strick"
const fs = require('fs') 
const path = require("path")
const package = require('../package')
var config = require('../lib/settings')

var  program

// Define the program options,  action-based sub-commands, and exec (serached for) sub-command.
var program = require('commander') 
 .version(package.version)
 
// action-based sub-commands
program.command('debug')
   .description( "show the internal-program object" )
   .action( function(options) { console.log("\n==\nprogram= ", program, '\n===\noptions = ',options); })

program.command('widget', 'widget commands')

 program.command('config <cmd> [key] [value]')
 .description( "Configure local settings: config [show|set <key value>|del <k>]")
 .option('-c --config <path>', 'Config', config.path )
 .option('-D --debug', 'Debug messages')
 .action( (cmd, k, v, options) => config_action(program, config, cmd, k, v) )

// Run this script by invoking:  program.parse
program.parse(process.argv);

async function config_action( program, config, cmd, k , v) {
  program.debug && console.log('cmd:',cmd,'\nk: ', k,'\nv: ', v, '\noptions: ', options)
  let o = config
  let settings = o.localSettingsFile
  o.deleteSettingsFile
  switch (cmd) {
    case 'show' :
      await console.log(JSON.stringify(config, null,2))
      break;
    case 'set' :
      o[k] = v 
      fs.writeFileSync( settings, JSON.stringify(o, null, 2), 'utf8')
      break;
    case 'get' : 
      process.stdout.write(JSON.stringify(o[k])+ "\n")
      break;
    case 'delete' :
      if (! config[k])  break;
      delete o[k]
      fs.writeFileSync( settings, JSON.stringify(o, null, 2), 'utf8')
      break;
    default : 
      throw new Error(`unknown cmd: ${cmd}` )
  }
}




