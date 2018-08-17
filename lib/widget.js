const uuid = require('uuid')
const fs = require('fs')
const Table = require('easy-table')
const  urlParse  = require('url').parse;

// JSONtests/widget/descriptors, were harvested by a phantomJS script.
// The phantomJS script writes { "data" : {...} } in each file.
// The Ozone Rest documentation the body,  a list of one { data: [{...}]}, 
// is where the testData.createWidget is derived, but from ".data".
// Ref:  
// [OWF 7.10 REST Documentation](http://host/owf/rest/#widget)
//      $ cd ~/projects/owf-cli/bin &&  node
function testcase( n = 0) {
  const readdir = require('fs').readdirSync
  const v = require('../lib/widget').validate
  var td = [ require('../tests/testData').createWidgetData]
  let dir =  '../tests/widgets/descriptors'
  readdir(dir).forEach( fn => td.push( require(`${dir}/${fn}`)))
  const program = { uuid: false }
  console.log(v(program, td[n]))
}

function validate(program, data) {
  if ( data.data ) return validate(program, data.data)
  let {imageUrlMedium, widgetUrl, widgetVersion, ...d} = data
  // if ( Array.isArray(d) ) return d.map( e => validate(program, e))
  if ( widgetUrl ) d.url = widgetUrl
  if ( imageUrlMedium ) d.imageUrlLarge = imageUrlMedium
  if ( widgetVersion ) d.version = widgetVersion
  if ( ! d.image ) d.image = d.imageUrlLarge
  if ( (! d.widgetGuid) || program.uuid ) d.widgetGuid = uuid()

  let l = [ 'universalName,name', 'image', 'url', 'widgetGuid', 'descriptorUrl','version',
    'imageUrlSmall', 'displayName']
  let reducer =  ( acc, cur) => { return(d[cur]  ? acc++ : acc )}
  l.forEach( n=> {
    if ( n.split(',').reduce(reducer, 0) != 1 ) 
       throw new Error(`Descriptor must have one of: ${n.replace(/,/g,', or ')}`)
  })
  // check that each url will parse
  //Object.keys(d).filter(k => /url/i.test(k)).forEach( k => urlParse(d[k]))
  return d
}

function validateFile(progarm, fp) {
  return validate( progarm, JSON.parse(fs.readFileSync(fp)))
} 

function tableOutput({data}) {
  let t = new Table
  let i =1
  data.forEach( e => {
    t.cell('##', i )
    t.cell('Name', e.value.namespace)
    //t.cell('UUID', e.id)
    //t.cell('URL', urlParse(e.value.url).path)
    t.cell('Name', e.value.universalName)
    t.cell('Users', e.value.totalUsers )
    t.cell('Groups', e.value.totalGroups)
    //t.cell('description', e.value.description)
    //t.cell('groups', e.value.groups)
    t.newRow()
    i++;
  })
  return(t.toString())
}

module.exports = {
  validate: validate,
  validateFile: validateFile,
  tableOutput: tableOutput
}