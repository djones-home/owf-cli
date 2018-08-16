const fs = require('fs'); 
const uuid = require('uuid')
const path = require('path')
var w = require('../lib/widget')

var program = { uuid: null }
var dir = '../tests/widgets/descriptors'
fs.readdirSync(dir).forEach(f => {
   console.log(`Validating:${dir}/${f}: `)
   console.log( w.validateFile(program, path.join(dir,f)))
})
