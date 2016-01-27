Meteor.startup( function () {
  SyncedCron.start();
if(Meteor.users.find().count()==0){
  Accounts.createUser({
    username: 'deleteMe',
    password: "X’ never, ever marks the spot"
      })
  console.log('\033[31m[!]Default User Created.\033[0m')
  console.log('\033[31m[!]user: deleteMe\033[0m')
  console.log("\033[31m[!]pwd: X’ never, ever marks the spot\033[0m")
  console.log('\033[31m[!]CREATE A NEW USER and DELETE THIS ONE ASAP\033[0m')
}


if(process.env.PATH_TO_SCRIPTS)  {
  PATH = process.env.PATH_TO_SCRIPTS
}else{PATH=''}

console.log('\033[32m[+]STARTING UP \033[0m')

//create indexes 
Domains._ensureIndex({"data": 1})
IPs._ensureIndex({"ip":1})
Hashes._ensureIndex({"md5": 1})
// Project._ensureIndex({
//       "osxcollector_incident_id" : 1,
//       "osxcollector_section" : 1,
//       "osxcollector_subsection" : 1
//     })
Project._ensureIndex({
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    })
Project._ensureIndex({
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    })
Project._ensureIndex({
      "osxcollector_incident_id" : 1
    })
Project._ensureIndex({
      "projectID":1
    }, { 'sparse': true } )
Project._ensureIndex({'flagged':true})
console.log("\033[32m[+]INDEXES CREATED \033[0m")

if ( BigCounts.find({}).count() == 0 ){
  BigCounts.insert({'label' : 'Total Count', 'count':0, 'icon':'fa-ambulance'})
  BigCounts.insert({'label' : 'Hash Count', 'count':0, 'icon':'fa-hashtag'})
  BigCounts.insert({'label' : 'Flagged Count', 'count':0, 'icon':'fa-flag'})
  BigCounts.insert({'label' : 'Blacklist Count', 'count':0, 'icon':'fa-ban'})
}
//create settings for APIs

//OpenDNS coming soon
// if ( Settings.find({'type':'OpenDNS_api_key'}).count() == 0 ){
//   Settings.insert({'type':'OpenDNS_api_key','value':'','api_key_setting':true})
// }

if ( Settings.find({'type':'Virus_Total_api_key'}).count() == 0 ){
  Settings.insert({'type':'Virus_Total_api_key','value':'','api_key_setting':true})
}

if ( Settings.find({'type':'Metascan_api_key'}).count() == 0 ){
  Settings.insert({'type':'Metascan_api_key','value':'','api_key_setting':true})
}
//haven't finished how to incorporate different liscense types for VirusTotal. We are still using the public API though. 
// if ( Settings.find({'type':'Virus_Total_request_limit'}).count() == 0 ){
//   Settings.insert({'type':'Virus_Total_request_limit','value':'','api_key_setting':true})
// }

if ( Settings.find({'type':'IBM_X-Force_api_key'}).count() == 0 ){
  Settings.insert({'type':'IBM_X-Force_api_key','value':'','api_key_setting':true})
}
if ( Settings.find({'type':'IBM_X-Force_api_password'}).count() == 0 ){
  Settings.insert({'type':'IBM_X-Force_api_password','value':'','api_key_setting':true})
}

if ( Settings.find({'path_to_scripts':{'$exists':true}}).count() == 0 ){
  Settings.insert({'path_to_scripts':''})
}

if ( Settings.find({'label':"IBM X-Force URL"}).count() == 0 ){
  Settings.insert({"label" : "IBM X-Force URL", "absmax" : 9, "absmin" : 0, "min" : 3, "max" : 9, "on" : true, "onView" : true, "flag_setting" : true, "apiType" : "ibm_domain_results"})
}

if ( Settings.find({'label':"Shadow"}).count() == 0 ){
  Settings.insert({"label" : "Shadow", "min" : 0, "max" : 1, "flag_setting" : true, "on" : false, "onView" : false, "absmax" : 1, "absmin" : -1, "apiType" : "shadow_results"})
}
if ( Settings.find({'label':"Blacklist"}).count() == 0 ){
  Settings.insert({"label" : "Blacklist", "min" : 2, "max" : 2, "flag_setting" : true, "onView" : true, "on" : true, "absmax" : 2, "absmin" : -1, "apiType" : "black_list"})
}
if ( Settings.find({'label':"VirusTotal"}).count() == 0 ){
  Settings.insert({"label" : "VirusTotal", "min" : 2, "max" : 100, "flag_setting" : true, "on" : true, "onView" : true, "absmax" : 56, "absmin" : 0, "apiType" : "vt_results"})
}
if ( Settings.find({'label':"Metascan"}).count() == 0 ){
  Settings.insert({"label" : "Metascan", "min" : 0, "max" : 42, "flag_setting" : true, "on" : true, "onView" : true, "absmax" : 42, "absmin" : 0, "apiType" : "mt_results"})
}
if ( Settings.find({'label':"IBM X-Force MD5"}).count() == 0 ){
  Settings.insert({"label" : "IBM X-Force MD5", "min" : 1, "max" : 100, "flag_setting" : true, "on" : true, "onView" : true, "absmax" : 100, "absmin" : 0, "apiType" : "ibm_md5_results"})
}
if (Settings.find({'flagging':{'$exists':true}}).count() == 0){
  Settings.insert({'flagging' :true, 'api_setting': true})
}

if (Settings.find({'cronBlacklist':{'$exists':true}}).count() == 0){
  Settings.insert({'cronBlacklist' :true, 'date_string': 'at 11:00 pm on Saturday'})
}
console.log("\033[32m[+]SETTINGS CREATED \033[0m")

if (PATH){
Meteor.call('updateBlacklist')
console.log('\033[32m[+]BLACKLIST UPDATED \033[0m')
}else{
console.log('\033[31m[!]SKIPPING BLACKLIST UPDATE\033[0m\n\033[41m[-]ADD PATH TO SCRIPTS IN SETTINGS\033[0m')
}

if (PATH){
  UploadServer.init({
    tmpDir: PATH + '.uploads/tmp',
    uploadDir: PATH + '.uploads/tmp/',
    checkCreateDirectories: true,
    // getDirectory: function(fileInfo, formData) {
    //   // create a sub-directory in the uploadDir based on the content type (e.g. 'images')
    //   return formData.contentType;
    // }

    finished: function(fileInfo, formFields) {
      // perform a disk operation
    },
    cacheTime: 100,
    mimeTypes: {
        "json": "application/json"
    }
  })

console.log('\033[32m[+]UPLOAD DIRECTORY CREATED\033[0m')
}else{
console.log('\033[31m[!]SKIPPING UPLOAD DIRECTORY CREATION\033[0m\n\033[41m[-]ADD PATH TO SCRIPTS IN SETTINGS AND RESTART APP\033[0m')
}
})

