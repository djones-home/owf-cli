const uuid = require('uuid')
const fs = require('fs')
const Table = require('easy-table')
const  urlParse  = require('url').parse;

function validate(program, data) {
  return data
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
    t.cell('Name', e.username || e.userRealName )
    t.cell('Id', e.id  )
    t.cell('Widgets', e.totalWidgets  )
    t.cell('Dashboards', e.totalDashboards  )
    t.cell('Stacks', e.totalStacks  )
    t.cell('Groups', e.totalGroups  )
    t.cell('email', e.email  )
    t.cell('LastLogin', e.lastLogin )
    t.newRow()
    i++;
  })
  return(t.toString())
}

/*
async function addGroup(program, groupName, widgetId) {
  try {
    let d = await owfRequest({program, restPath: "group"})
    let gid = JSON.parse(d).data.filter(e => e.name == groupName)[-1].id
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
async function getGroup(program, re) {
  try {
    let data = await owfRequest({program, restPath: "group"})
    return JSON.parse(data).data.filter(o => {
      return ( RegExp(re).test( o.id ) ||
        RegExp(re).test( o.name ) ||
        RegExp(re).test( o.displayName ) ) 
    })
  } catch (err) {
     console.error(err)
     process.exit(1)
  }
}
*/

module.exports = {
  validate: validate,
  validateFile: validateFile,
  tableOutput: tableOutput
}
