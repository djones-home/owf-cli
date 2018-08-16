const uuid = require('uuid')
const fs = require('fs')
const Table = require('easy-table')
const  urlParse  = require('url').parse;

function validate(program, data) {
  if ( data.data ) return validate(program, data.data)
  let {imageUrlMedium, widgetUrl, widgetVersion, ...d} = data
  // if ( Array.isArray(d) ) return d.map( e => validate(program, e))
  if ( widgetUrl ) d.url = widgetUrl
  if ( imageUrlMedium ) d.imageUrlLarge = imageUrlMedium
  if ( widgetVersion ) d.version = widgetVersion
  if ( ! d.image ) d.image = d.imageUrlLarge
  if ( (! d.widgetGuid) || program.uuid ) d.widgetGuid = uuid()

  let l = [ 'universalName', 'image', 'url', 'widgetGuid', 'descriptorUrl','version',
    'imageUrlSmall', 'displayName']
    
  l.forEach( n=> {
    if (! d[n] ) throw new Error(`Descriptor must have: ${n}`)
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