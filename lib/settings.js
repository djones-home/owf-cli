var path = require('path')
var fs = require('fs')
var shell = require('shelljs')

var name =  require('../package').name
var settings = path.join(process.env.HOME, ".config", name, "config.json")

// Default settings
var config =  {
  cert: `${process.env.HOME}/certs/admin.pem`,
  ca: `${process.env.HOME}/certs/ca-crt.pem`,
  passphrase: 'password', 
  baseUrl: 'https://ci10.ccs.nps.edu/owf', 
  uri: '/widget',
  localSettingsFile: settings,
}

// Merge local settings from HOME/.config/NAME/config.json
if ( fs.existsSync(settings) ) {
  config = Object.assign( config, JSON.parse(fs.readFileSync(settings, 'utf8')));
} else {
// Make local settings for a new user.
   if (! fs.existsSync(path.dirname(settings)) ) {
     if (shell.mkdir('-p', path.dirname(settings)).code != 0 ) {
        process.stderr.write ('Could not initialize local setting: ' + settings )
        process.exit(1)
     }
    }
   fs.writeFileSync( settings, JSON.stringify(config, null, 2), 'utf8')
   fs.chmodSync( settings, '0600')
   fs.chmodSync(path.dirname(settings), '0700')
}

module.exports = config
