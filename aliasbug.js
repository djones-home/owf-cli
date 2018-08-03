#!/usr/bin/env node
"use strick"

// The behavior of commander changes with .alias() in line 11.
// Define the program options,  action-based sub-commands, and exec (serached for) sub-command.
var program = require('commander') 
  .version('0.1.0')
 
 program.command("list")
   .description("list , AKA get ")
   .alias("get")
   .action((options) => {
     console.log('This is list command, AKA get')
   })


program.command('test <cmd>')
  .description('Test  commands')
  .action( (cmd, options) => {
  console.log(' test cmd: ', cmd);
  });

program.parse(process.argv)

//$ ./aliasbug.js test foo 
// => test cmd:  foo 
// $ ./aliasbug.js test get => 
// => test cmd:  get 
// => aliasbug-list(1) does not exist, try --help
//  