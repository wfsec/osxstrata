


Template.settings.rendered = function () {
  var draw = function(){
  var cursor = Settings.find({'flag_setting':true}).fetch()
    for (var i = 0; i < cursor.length; i++) {
      Session.set("slider"+cursor[i]._id , [cursor[i].min, cursor[i].max]);
  
   
    this.$("#slider"+cursor[i]._id).noUiSlider({
      start: [cursor[i].min,cursor[i].max],
      connect: true,
      tooltips: true,
      range: {
        'min': cursor[i].absmin  ,
        'max': cursor[i].absmax      
      },
      pips:{
        mode: 'steps',
        density:2
      }
    
   }).on('change', function (ev, val)
   {
    var thin = ev.target.id.replace('slider','')
    Session.set(ev.target.id, [Math.round(val[0]), Math.round(val[1])]);
   })
 }
}
 Tracker.autorun(function () {
    draw() 
  })
  }

  Template.settings.helpers({
    counter: function () {
      return Session.get("counter");
    },
    slider: function () {
      return Session.get("slider");
    },
    settings: function () {
      return Settings.find({flag_setting:true})
    },
    settingsChanges: function () {
        var cursor = Settings.find({flag_setting:true}).fetch()
        settingsChange=[]
        for (var i = 0; i < cursor.length; i++) {
          settingsChange.push({'label':cursor[i].label, 'on':cursor[i].onView, 'min': Session.get('slider'+cursor[i]._id)[0], 'max':Session.get('slider'+cursor[i]._id)[1] })
        }
        return settingsChange
    }
    ,
    check: function () {
      cursor  = Settings.find({flagging:{$exists:true}}).fetch()
       if(cursor.length != 0){
      if (cursor[0].flagging){
        return 'checked'
      }}
    },
    checkAPi: function (on) {
      if(on){
        return 'checked'
      }else{
        return ''
      }
    },
    display: function(){
      cursor  = Settings.find({flagging:{$exists:true}}).fetch()
      if(cursor.length != 0){
      if (cursor[0].flagging){
        return 'display'
      }
      else{return 'none'}
    }
    },
    displayFlag: function(flagging){
      if(flagging){
        return 'display'
      }else{
        return 'none'
      }
    }
    ,
    users: function  () {
      cursor = Meteor.users.find({}).fetch()
      users = []
      for (var i = 0; i < cursor.length; i++) {
        users.push({'account': cursor[i].username,'createdAt':cursor[i].createdAt,'id':cursor[i]._id})
      };
      return users
    },
    onCheck: function(on){
      if(on){
        return 'check'
      }else{
        return 'times'
      }
    },
    api_settings: function() {
      return Settings.find({'api_key_setting':true},{sort:{type:1}})
    },
    edit_api_setting: function(){
      return Settings.find({'api_key_setting':true, 'type': Session.get('api-type')})

    },
    shadow: function(val, apitype){
      if (apitype.match(/key/g) || apitype.match(/password/g) )
      {
        return '****************' + val.substring(val.length - 10 , val.length)
      }else {return val}
    },
    findmin: function(id){
      return Session.get('slider'+id)[0]
    },
    findmax: function(id){
      return Session.get('slider'+id)[1]
    },
    edit: function(type){
      return type.replace(/_/g,' ').toUpperCase()
    },
    // path: function(){
    //   return Settings.find({'path_to_scripts':{'$exists':true}}).fetch()[0]['path_to_scripts']
    // },
    deleteUser: function(){
      return [{'id': Session.get('deleteUser')[0], 'username': Session.get('deleteUser')[1]}] 
    }, 
    loggedInUser: function(username){
      if(username != Meteor.user()['username'])
      { 
        return 'disabled'
      }
    }
  });

  Template.settings.events({
    'change .master': function (ev, tmpl){
      cursor  = Settings.find({flagging:{$exists:true}}).fetch()
      Meteor.call('changeFlagging',cursor[0]._id, !cursor[0].flagging )
      
    },
    'click #submit-flag-changes': function (ev, tmpl){
      $('#modalAlert').openModal();
    },
    'click .edit-api-settings': function (ev, tmpl){
       Session.set('api-type',ev.currentTarget.id)
      $('#modalSettings').openModal();
    },
    'change .OnOrOff': function  (ev, tmpl) {
   
        Meteor.call('changeApiFlagging',this._id, !this.onView )
      },
    'click #cancelChange' : function(ev, tmpl){
      $('.modal').closeModal();
      var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
    },
    'click #changeSettings': function(ev, tmpl){
    cursor  = Settings.find({flag_setting:{$exists:true}}).fetch()
    for (var i = 0; i < cursor.length; i++) {
      Meteor.call('updateSettings', cursor[i]._id, Session.get('slider'+cursor[i]._id)[0], Session.get('slider'+cursor[i]._id)[1], cursor[i].onView)
    };
    
    if(document.getElementById('applyAllButMod').checked){
      Meteor.call('removeFlags',false)

    }else if(document.getElementById('applyAll').checked)
          {Meteor.call('removeFlags',true)}
    cursor2  = Settings.find({flag_setting:{$exists:true}, onView:true}).fetch()
    for (var i = 0; i < cursor2.length; i++) {
      //instead of pulling data from database pull from ui, eek. for some reason the update from line 128 doesn't happen before this query on line 137
      Meteor.call('flagLevelChange', cursor2[i].apiType,Session.get('slider'+cursor2[i]._id)[0],Session.get('slider'+cursor2[i]._id)[1] )

    };


    },
    'click #changeSettingsAPIKEYS': function (ev, tmpl){
      $('#modalSettings').closeModal();
      var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
      var doc = document.getElementsByClassName('api-key-setting')
      for (var i = 0; i < doc.length; i++) {
        Meteor.call('apiKeyUpdate',doc[i].id, doc[i].value)
      };
      },
      // 'click #path_to_scripts_modal_open' : function (ev, tmpl){
      // $('#modalPath').openModal();
      // },
      // 'click #changeSettingsPATH': function (ev, tmpl){
        
      //   Meteor.call('updatePath',document.getElementById("path_to_scripts").value)

      // $('#modalPath').closeModal();

      // },
      'click .fa-level-up' : function (ev, tmpl) {
        Materialize.toast('Updating Blacklist',5000)
        Meteor.call('updateBlacklist', function(err, data){
          Materialize.toast(data, 5000)
        })
      },
      'click .fa-trash-o' : function (ev, tmpl) {
        $('#modalDelete').openModal();
        user = Meteor.users.find({'_id':ev.target.id}).fetch()
        Session.set('deleteUser',[user[0]._id,user[0].username ])
       
           
      },
      'click #deleteTheUser': function (ev, tmpl){
        Meteor.call('deleteUser', Session.get('deleteUser')[0])
        Materialize.toast("Wow you sure didn't like "+ Session.get('deleteUser')[1] + " did you?", 8000)
        
      },
      'click #add-account': function (ev, tmpl){
        $('#modalAdd').openModal()
      },
      'click #edit_user':function (ev, tmpl){
        if (ev.target.className.match(/disabled/g)){
          Materialize.toast("You can't edit this user",5000)
        }else{
                $('#modalEditUser').openModal()
        }
      }
  });


  


