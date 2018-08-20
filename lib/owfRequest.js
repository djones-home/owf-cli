const fs = require('fs')
const https = require('https'); 
const { URL } = require('url');
const querystring = require("querystring");

function owfRequest({program, method, restPath, paramJson, dataJson, options, headers}) {
  var url = `${program.url}/${restPath}`
  if (paramJson)  url += `?${querystring.stringify({data: JSON.stringify(paramJson)})}`
  if (typeof headers === "undefined") headers = { 'content-type' : 'application/json' }
  if (typeof method === "undefined") method = "GET";
  let u = new URL(url)
  let httpOpts =  {
        method: method,
        path: u.pathname + u.search,
        ca: fs.readFileSync(program.ca), 
        key: fs.readFileSync(program.key),
        cert: fs.readFileSync(program.cert),
        passphrase: program.pw,
        hostname: u.hostname,
        port: u.port,
        headers: headers,
   }
  return new Promise ((resolve, reject)=> {
    const  req = https.request(httpOpts, (res) => { 
      let body = []
      res.on('data', (chunk) => { 
        body.push(chunk)
      }).on('end', ()=> resolve( Buffer.concat(body).toString() ));
            
      if ( res.statusCode != 200 ) {
        //console.log(res)
        reject( new Error('Request Failed.\n' +`Status Code: ${res.statusCode}\n` ));
      }
    }); 
    req.on('error', (e) => reject(e))
    req.end()
    //req.end(JSON.stringify(dataJson))
  })
}

module.exports = {
  owfRequest: owfRequest
}