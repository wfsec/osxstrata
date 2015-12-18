var exec = Npm.require('child_process').exec;
var Fiber = Npm.require('fibers');
var Future = Npm.require('fibers/future');
if(!Settings.find().count() == 0)  {
  PATH = Settings.find({'path_to_scripts':{'$exists':true}}).fetch()[0]['path_to_scripts']
}else{PATH=''}

Meteor.methods({
  updateFlag: function(id,status) {
    Project.update(id,{$set: {flagged: status, flaggedBy:Meteor.userId()}})
    if(status){
    BigCounts.update({'label':'Flagged Count'},{'$inc':{'count':1}})
    }else{
     BigCounts.update({'label':'Flagged Count'},{'$inc':{'count':-1}}) 
    }
  },
  changeFlagging: function(id,changeto){
    
    Settings.update(id,{$set: {flagging:changeto}})
    sleep(5000)
    upadateCounts()
  },
  changeApiFlagging: function(id, changeto){
    Settings.update(id,{$set: {onView:changeto}})

  },
  updateSettings: function(id,min,max,onView){
    console.log(Settings.update(id,{$set:{min:min, max:max, on:onView}}) + "Settings Updated")

  },
  removeFlags: function(flagBy){
    if(flagBy){
      Project.update({},{$set:{flagged:false}},{multi:true})
      Project.update({flaggedBy:{$exists:true}},{$unset:{flaggedBy:1}},{multi:true})
    }else{
      Project.update({flaggedBy:{$exists:false}},{$set:{flagged:false}},{multi:true})
    }
    sleep(5000)
    upadateCounts()

  },
  flagLevelChange: function(api,min,max){
    api=api
    q ={}
    q[api]={$gte:min, $lte: max}
    Project.update(q,{$set:{flagged:true}},{multi:true})

    sleep(5000)
    upadateCounts()
  },
  apiKeyUpdate: function(type,value){

    Settings.update({'type':type},{$set:{'value':value}})
  },
  updatePath: function (val){
    Settings.update({'path_to_scripts':{'$exists':true}},{'$set':{'path_to_scripts':val}})
  },
  updateBlacklist: function() {
    if (!PATH){
      return 'ERROR NOT SENT: NO PATH TO SCRIPTS IN SETTINGS'
    }
    console.log('\033[32m[+]Updating Blacklist\033[0m')
    var fut = new Future();
    // exec('python strata.py -b', function (error, stdout, stderr) {
      exec('python ' + PATH + 'strata.py -b', function (error, stdout, stderr) {
       console.log(error, stderr, stdout)
      // if you want to write to Mongo in this callback
      // you need to get yourself a Fiber
      new Fiber(function() {
        fut.return('Update Blacklist Completed Run');
      }).run();

    });
    return fut.wait();
  },
  importJson: function (filename,analysis) {
    if (!PATH){
      return 'ERROR NOT SENT: NO PATH TO SCRIPTS IN SETTINGS'
    }
    var fut = new Future();

    if(analysis){
    cmd  = 'python ' + PATH + 'strata.py -a ' + PATH + filename
    }else{
          cmd  = 'python ' + PATH + 'strata.py -n ' + PATH  + filename

    }
    console.log(cmd)
    exec(cmd, function (error, stdout, stderr) {
      console.log(error, stdout, stderr)

      new Fiber(function () {
        fut.return('Python was here')
      }).run()

    })
    return fut.wait()
    

  },
  virustTotal: function (apiTYPE, data) {
    if (!PATH){
      return 'ERROR NOT SENT: NO PATH TO SCRIPTS IN SETTINGS'
    }
    // console.log(apiTYPE,data)
    if(apiTYPE == 'md5'){
    cmd  = 'python ' + PATH + 'strata.py --virusTotal --hash ' + data
    }else{
    cmd  = 'python ' + PATH + 'strata.py --virusTotal --url ' + data  
    }
    // console.log(cmd)
    exec(cmd, function (error, stdout, stderr) {
      console.log(error, stdout, stderr)
          })
    console.log(cmd)
    sleep(15000)

  },
  xforce: function (apiTYPE, data,id) {
    // console.log(apiTYPE,data)
    if (!PATH){
      return 'ERROR NOT SENT: NO PATH TO SCRIPTS IN SETTINGS'
    }
    if(apiTYPE == 'md5'){
    cmd  = 'python ' + PATH + 'strata.py --ibmXforce --hash ' + data
    }else{
      if (data.indexOf('/') != -1)
      {
        spliturl = data.split('/')
       domain = spliturl[2]
      }
    else if(data.indexOf('_') != -1)
        {
         spliturl = data.split('_')
          domain = spliturl[1]
        }
    else{
    domain = data
    }
    cmd  = 'python ' + PATH + 'strata.py --ibmXforce --url "' + domain +'" ' + id  
    }
    console.log(cmd)
    exec(cmd, function (error, stdout, stderr) {
      console.log(error, stdout, stderr)
          })
    
    

  },
  shadowServerCheck: function (p_id, id, md5) {
    var cursor = Hashes.findOne({'md5': md5,'shadow_results':{'$exists':true}})

    var urlmd5 = 'http://bin-test.shadowserver.org/api?md5=' + String(md5)

    if (!cursor){
          try {
            var result = HTTP.call("GET",urlmd5)
            if(result.content.length > 34) {
              console.log('\033[32m ITS THERE\033[0m')
              Hashes.insert({'shadow_results': -1, 'md5':md5})
              Project.update({'md5': md5},{$set: {'shadow_results': -1,'shadow_url': urlmd5}},{multi: true})
            }else{
              Hashes.insert({'shadow_results': 1, 'md5':md5})
              Project.update({'md5': md5},{$set: {'shadow_results': 1,'shadow_url': urlmd5}},{multi: true})

            }
          } catch (e) {
            console.log('Something went wrong')
          }
  }else{
  console.log(Project.update({'md5': md5},{$set: {'shadow_results': cursor['shadow_results'] ,'shadow_url': urlmd5}},{multi: true}))
  
    }
},
blacklistCheck: function (p_id, id, domain){
  if(typeof(domain) == 'string' && domain.indexOf('//') != -1){
    domain = String(domain).split('/')[2]
    if (domain[0] != 'file:'){
    var exactMatch = Domains.find({data:domain,source:{$ne:'IBMXFORCE'}}).fetch()
    if (exactMatch.length >0 ){
      var sourceList = []
      var dataList = []
      for(var i = 0;i<exactMatch.length; i++)
      {
        sourceList.push(exactMatch[i]['source'])
        dataList.push(exactMatch[i]['data'] + ' , '+ exactMatch[i]['lastDate'])
      }
      Project.update(id,{$set: {black_list:2, blacklist_source:sourceList, blacklist_data: dataList}})
    }else{
      var search = new RegExp(domain.replace('www.',''), 'i');
      cursor = Domains.find({data: {$regex:search},source:{$ne:'IBMXFORCE'}}).fetch()
      if(cursor.length > 0){
        Project.update(id,{$set: {}})
        var sourceList = []
        var dataList = []
        for(var i = 0;i<cursor.length; i++)
        {
          sourceList.push(cursor[i]['source'])
          dataList.push(cursor[i]['data'] + ' , '+ cursor[i]['lastDate'])
        }
        Project.update(id,{$set: {black_list:1, blacklist_source:sourceList, blacklist_data: dataList}})
      } 
      
      else{
      Project.update(id,{$set: {black_list:-1}})
      }
    }
  }
}
  else if (typeof(domain) == 'string'){
    if(domain.indexOf('_') > -1){
      domain = domain.split('_')[1]
    }
    var exactMatch = Domains.find({data:domain,source:{$ne:'IBMXFORCE'}}).fetch()
    if (exactMatch.length >0 ){
      var sourceList = []
      var dataList = []
      for(var i = 0;i<exactMatch.length; i++)
      {
        sourceList.push(exactMatch[i]['source'])
        dataList.push(exactMatch[i]['data'] + ' , '+ exactMatch[i]['lastDate'])
      }
      Project.update(id,{$set: {black_list:2, blacklist_source:sourceList, blacklist_data: dataList}})
    }else{
      var search = new RegExp(domain.replace('www.',''), 'i');
      cursor = Domains.find({data: {$regex:search},source:{$ne:'IBMXFORCE'}}).fetch()
      if(cursor.length > 0){
        Project.update(id,{$set: {}})
        var sourceList = []
        var dataList = []
        for(var i = 0;i<cursor.length; i++)
        {
          sourceList.push(cursor[i]['source'])
          dataList.push(cursor[i]['data'] + ' , '+ cursor[i]['lastDate'])
        }
        Project.update(id,{$set: {black_list:1, blacklist_source:sourceList, blacklist_data: dataList}})
      } 
      
      else{
      Project.update(id,{$set: {black_list:-1}})
      }
    }

  } 


  },
  deleteUser: function (id){
    Meteor.users.remove({'_id':id})
  },
  createAccount: function (username, pwd){
    Accounts.createUser({
    username: username,
    password: pwd
      })
  },
  changeUserPassword: function(old, newp){
    Accounts.changePassword(old, newp,
      function(err){
        if(err){
        return err
      }
      }
    )
  },
  deleteCollection: function (id){
    return Project.remove({"osxcollector_incident_id":id})

  }
})
function upadateCounts(){
var fut = new Future();
    // exec('python strata.py -b', function (error, stdout, stderr) {
      exec('python ' + PATH + 'strata.py -u', function (error, stdout, stderr) {
      console.log(error,stdout,stderr)
      // if you want to write to Mongo in this callback
      // you need to get yourself a Fiber
      new Fiber(function() {
        fut.return('Python was here');
      }).run();

    });
    return fut.wait();
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function isAlpha(l){
  if (l.match(/[a-z]/i)){
    return true
  }
  return false
}

function sleep(milliseconds) {

var start = new Date().getTime();

var stop = new Date().getTime()+milliseconds;

while(new Date().getTime()<stop){ }
}