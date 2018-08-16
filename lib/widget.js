const uuid = require('uuid')
const fs = require('fs')

function validate({imageUrlMedium, widgetUrl, widgetVersion, ...d}) {
  if ( d.data ) return validate(d.data)
  // if ( Array.isArray(d) ) return d.map( e => validate(e))
  if ( widgetUrl ) d.url = widgetUrl
  if ( imageUrlMedium ) d.imageUrlLarge = imageUrlMedium
  if ( widgetVersion ) d.version = widgetVersion
  if ( ! d.image ) d.image = d.imageUrlLarge
  if ( (! d.widgetGuid) || program.uuid ) d.widgetGuid = uuid()

  let l = [ 'universalName', 'image', 'url', 'widgetGuid', 'descriptorUrl','version',
    'imageUrlSmall', 'displayName']
    
  l.forEach( n=> {
    if (! d[n] ) throw new Error(`Discriptor must have ${n}`)
  })
  // check that each url will parse
  return d
}

function validateFile(fp) {
  return validate( JSON.parse(fs.readFileSync(fp)))
}

module.exports = {
  validate: validate,
  validateFile: validateFile
}