const uuid = require('uuid')
const fs = require('fs')
const Table = require('easy-table')
const  urlParse  = require('url').parse;
const {owfRequest} = require('../lib/owfRequest')
const querystring = require("querystring");


// JSON tests/widget/descriptors, were harvested by a phantomJS script.
// The phantomJS script writes { "data" : {...} } in each file.
// The Ozone Rest documentation  body,  has a  { data: [{...}]}, 
// The testData.createWidget is derived from 
// [OWF 7.10 REST Documentation](http://ci10.ccs.nps.edu/owf/rest/#widget)
function testcase( program, n = 0 ) {
  var td = [ require('../tests/testData').createWidgetData]
  let dir =  '../tests/widgets/descriptors'
  fs.readdirSync(dir).forEach( fn => td.push( require(`${dir}/${fn}`)))
  if ( n == null ) { Object.keys(td).forEach( k => console.log(`${k}:`, validate(program,td[k])))
  } else { console.log(`${n}:`, validate(program, n)) }
}

// validate is guess work, between a collection of widgets in tests/testData and tests/widgets.
// It is unclear  which of keys are current, for example should
// the descriptors have version or widgetVersion?, image or icon and/or [Small|Large|Medium]?
function validate(program, data) {
  if ( data.data ) return validate(program, data.data)
  if ( Array.isArray(data) ) return data.map( e => validate(program, e))
  let {imageUrlMedium, widgetUrl, widgetVersion, 
      widgetTypes = ['standard'], ...d} = data
  if ( ! d.image ) d.image = d.imageUrlLarge || imageUrlMedium || d.imageUrlSmall
  if ( (! d.widgetGuid) || program.uuid ) d.widgetGuid = uuid()
  if ( widgetUrl ) d.url = d.url || widgetUrl
  if ( imageUrlMedium ) d.imageUrlLarge = imageUrlMedium
  if ( widgetVersion ) d.version = widgetVersion
  if ( ! d.version ) d.version = "0"
  if ( program.widgetVersion ) d.version = program.widgetVersion
  //if (program.groups) d.groups = [{name: 'OWF Users', id: 20}]
  // although I see groups in the REST API for I had to add groups after create.
  if ( typeof(d.id) == 'undefined') d.id = ''
  // force the widgetType to have name and id properties
  let wt = [ 'none', 'standard','administration', 'marketplace', 'metric', 'fullscreen' ]
  d.widgetTypes = widgetTypes.map( e => { 
     if (typeof(e) == 'string') let name = e
     if ( typeof(e) == 'object') {
        let { name = 'standard' } = e
     }
     return { name: name, id: wt.findIndex( (n) => { return n == name })}
  });
  if ( /fullscreen/i.test(JSON.stringify(d.widgetTypes)))  {  d.widgetTypes = [{name:"fullscreen",id:5}] }

  let l = [ 'universalName', 'image', 'url', 'widgetGuid', 'descriptorUrl','version']
  l.forEach( n=> {
    if ( typeof(d[n]) == 'undefined')  
       throw new Error(`Descriptor must have one of: ${n}`)
  })
  // assure that each url will parse something,  and when given the option, set host
  Object.keys(d).filter(k => /url|icon|image/i.test(k)).forEach( k => {
    let u = urlParse(d[k])
    if( u.href.length == 0 ) u = urlParse("http://")
    if( u.host && program.host ) u.host = program.host
    d[k] = u.href
  })
  return d
}

function validateFile(program, fp) {
  return validate( progarm, JSON.parse(fs.readFileSync(fp)))
} 

function tableOutput({data}) {
  let t = new Table
  let i =1
  data.forEach( e => {
    t.cell('##', i )
    //t.cell('UUID', e.id)
    t.cell('Name', e.value.universalName || e.value.namespace || urlParse(e.value.url).path)
    t.cell('Users', e.value.totalUsers )
    t.cell('Groups', e.value.totalGroups)
    //t.cell('description', e.value.description)
    //t.cell('groups', e.value.groups)
    t.newRow()
    i++;
  })
  return(t.toString())
}

async function addGroup(program, groupName, widgetId) {
  try {
    let d = await owfRequest({program, restPath: "group"})
    let groups = JSON.parse(d).data
    let g = groups.filter(e => e.name == groupName).pop()
    let gid = g.id
    //console.error('got group id', gid)
    let qs  = {
      "widget_id": widgetId,
      "tab": "groups",
      "update_action": "add",
      "data": JSON.stringify([{"name": groupName, "id":gid }])
    }
    let data = await owfRequest({program, method: 'PUT', restPath: `widget?${querystring.stringify(qs)}`} )
    console.log(`Added ${groupName} group ${gid} to widget`, data)

  } catch(err) {
      console.error(err)
      process.exit(1)
  }

}
async function getWidget(program, re ) {
  try {
    let data = await owfRequest({program, restPath: "widget"})
    return JSON.parse(data).data.filter(w => {
      return ( RegExp(re).test( w.id ) ||
        RegExp(re).test( w.value.namespace ) ||
        RegExp(re).test( w.value.universalName ) ) 
    })
  } catch (err) { 
    console.error(err)
    process.exit(1)
  }
}

module.exports = {
  validate: validate,
  validateFile: validateFile,
  tableOutput: tableOutput,
  testcase: testcase,
  getWidget: getWidget,
  addGroup: addGroup
}