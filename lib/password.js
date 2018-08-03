'use strict';
const inquirer = require('inquirer');

// Function Implementation for password, return first turthy choice, or inquirer.prompt for.
// The return value is an inquirer-like object, i.e. { pw: 'SECRET' }.

function generatePwPromise( choices ) {
  // let choice = [ pw, program.password, process.env[`${program.name}_PW`], config.pw ].find( e=> { return(e) })
  if (choices) {
     let pick = choices.find( e=> { return(e) })
     if (pick) return Promise.resolve({pw: chioce}); 
  }
  return inquirer.prompt([ { type: 'password', message: 'Password', name: 'pw', mask:'*'} ])
}

exports.generatePwPromise = generatePwPromise

// Caller Implementation: 
// var pickList = [ pw, program.password, process.env[`${program.name}_PW`], config.pw ]
// generatePwPromise(pickList).then( rv => { console.log( "TESTCASE password: ",  rv.pw )}).catch( console.error )



