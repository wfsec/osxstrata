Template.layout.helpers({
findID: function (){
	return !!Session.get('projectID')

},
data: function (){
	return Session.get('file_info')
},
found: function (){
	return Session.get('found')
},
details: function (){
	return Session.get('scan_details')
},
score: function (){
	return Session.get('score')
},
whichToShow: function (whichThirdParty){
	return whichThirdParty == Session.get('thirdparty')
},
thirdParty : function () {
				return Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))}})
	},
	subsections: function(){
		if (String(Session.get('activePage')).match(/Chrome/g)){
			return [{"name":"flagged"},
					{"name":"history"},
					{"name":"cookies"},
					{"name":"archived_history"},
					{"name":"login_data"},
					{"name":"top_sites"},
					{"name":"web_data"},
					{"name":"databases"},
					{"name":"local_storage"},
					{"name":"preferences"}
					]
		}else if (String(Session.get('activePage')).match(/Accounts/g)){
			return [{"name":"flagged"},
					{"name":"system_admins"},
					{"name":"system_users"},
					{"name":"social_accounts"},
					{"name":"recent_items"}]

		}else if (String(Session.get('activePage')).match(/Applications/g)){
			return [{"name":"flagged"},
					{"name":"applications"},
					{"name":"install_history"}]

		}else if (String(Session.get('activePage')).match(/Downloads/g)){
			return [{"name":"flagged"},
					{"name":"downloads"},
					{"name":"email_downloads"},
					{"name":"old_email_downloads"}]
		}else if (String(Session.get('activePage')).match(/Firefox/g)){
			return [{"name":"flagged"},
					{"name":"webapps_store"},
					{"name":"json_files"},
					{"name":"history"},
					{"name":"signons"},
					{"name":"permissions"},
					{"name":"addons"},
					{"name":"extension"},
					{"name":"health_report"},
					{"name":"cookies"},
					{"name":"formhistory"},
					{"name":"downloads"},
					{"name":"content_prefs"}]
		}else if (String(Session.get('activePage')).match(/Kernal Ext/g) || String(Session.get('activePage')).match(/kext/g)){
			return [ {"name": "flagged"}]

		}else if (String(Session.get('activePage')).match(/Mail/g)){
			return [{"name":"flagged"}]

		}else if (String(Session.get('activePage')).match(/Quarantines/g)){
			return [{"name":"flagged"}]

		}else if (String(Session.get('activePage')).match(/Safari/g)){
			return [{"name":"flagged"},
					{"name":"history"},
					{"name":"downloads"},
					{"name":"databases"},
					{"name":"localstorage"}
					]
		}else if (String(Session.get('activePage')).match(/Startup/g)){
			return [{"name":"flagged"},
					{"name":"scripting_additions"},
					{"name":"login_items"},
					{"name":"launch_agents"}]
		}else if (String(Session.get('activePage')).match(/Flagged/g)){
			return [ {"name": "accounts"},
					{"name":"applications"},
					{"name": "chrome"},
					{"name" : "downloads"},
					{"name" : "firefox"},
					{"name" : "kext"},
					{"name" : "mail"},
					{"name" : "quarantines"},
					{"name" : "safari"},
					{"name" : "startup"}]

		}
	},
	checkName: function(name){
		if (name == 'flagged')
		{
			return true
		}else{
			return false
		}

	},
	countChecked: function (){
		return Session.get('checked')
	},
	usersCheck: function(){
		var count = Meteor.users.find().count()
		if(count>0){
			return false
		}else{
			return true
		}
	},
	shorten: function(link){

		return link.substring(0, 35) + '...'
	},
	iterShadow: function() {
	  var list = []
	  var index = 0
	  var doc = Session.get('scan_details')
	 _(doc).each( function( value, key, doc) {
	        list[index] = {};
	        list[index]['value'] = value;
	        list[index]['key'] = key;
	    		
	        index++;
	    });
	    return list;

	},
	iterXforceURL: function(ob) {
	  var list = []
	  var index = 0
	  var doc = ob
	 _(doc).each( function( value, key, doc) {
	 	
	 		

	        list[index] = {};
	        list[index]['value'] = value;
	        list[index]['key'] = key;
	    		
	        index++;
	    });
	    return list;

	}
})

Template.layout.rendered = function () {

// $(document).ready(function(){
//     $('.modal-trigger').leanModal({
//       dismissible: true, // Modal can be dismissed by clicking outside of the modal
//       opacity: .2, // Opacity of modal background
//       in_duration: 300, // Transition in duration
//       out_duration: 200, // Transition out duration);
// })
//   });
	
 $(document).ready(function() {
    $('select').material_select();
  });
    

var parts = location.href.split('/')
target = parts[5].substring(0,1).toUpperCase() + parts[5].substring(1,parts[5].length)
Session.set('projectID', parts[4])
Session.set('activePage',target)
Session.set('next',true)
Session.set('skipcursor',0)
Session.set("query",pageQuery(target))
Session.set('onlyFlagged',false)
Session.set('showResults',25)
Session.set('checked',0)
Session.set('ids',[])
Session.set('begDate','2000-01-01')
Session.set('endDate','2100-01-01')


 Tracker.autorun(function () {
    draw() 
  })


}



Template.layout.events({
'change #amount-to-show' : function (evt,tmpl) {
		var toShow  = tmpl.find('#amount-to-show').value
		Session.set('showResults',Number(toShow))
		Session.set('skipcursor', 0)
	},
'change #check-all': function (evt,tmpl) {
		now = Session.get('checked')
		var cbs = document.getElementsByClassName('coll');
		checked = Session.get('checked')
  		for(var i=0; i < cbs.length; i++) {
    		if(cbs[i].type == 'checkbox' && cbs[i].id != 'check-all' && cbs[i].checked != evt.target.checked ) {
    		  cbs[i].checked = evt.target.checked;
    		  if (evt.target.checked){
    		  	checked++;
    		  }else{checked= 0}
    		}
  		}
  		Session.set('checked',checked)
  		setIds()
  		if(evt.target.checked){

  		Materialize.toast(Session.get('checked') + ' checked', 1000)

  		}else{
  		Materialize.toast(now + ' unchecked', 1000)

  		}
	},
	'click .coll' : function(evt,tmpl){
		if (evt.target.checked){
			Session.set('checked', Number(Session.get('checked'))+1)
			Materialize.toast(Session.get('checked') + ' checked', 1000)
			setIds()

		}else{
			Session.set('checked', Number(Session.get('checked')) - 1)
			Materialize.toast(Session.get('checked') + ' checked', 1000)
			setIds()

		}
	},
	'click .fa-flag-o' : function (evt,tmpl) { 
		Meteor.call('updateFlag', this._id, true)
	},
	'click .fa-flag' : function (evt,tmpl) { 
		Meteor.call('updateFlag', this._id, false)
	},	
'click .xforce': function(evt,tmpl) {
		 checked = Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))}}).fetch()
		
		 for (var i = 0; i < checked.length; i++) {
		 	if('md5' in checked[i]){
		 		Materialize.toast(checked[i]['md5'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','md5', checked[i]['md5'],checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
		 		}
		 	//This needs to be completed on the virustotal.py
		 	if('url' in checked[i]){
		 		Materialize.toast(checked[i]['url'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['url'],checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
				
		 	}
		 	if('referrer' in checked[i]){
		 		Materialize.toast(checked[i]['referrer'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['referrer'],checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
				
		 	}
		 	if('signon_realm' in checked[i]){
		 		Materialize.toast(checked[i]['signon_realm'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['signon_realm'],checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
				
		 	}
		 	if('origin' in checked[i]){
		 		Materialize.toast(checked[i]['origin'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['origin'],checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
				
		 	}
		 	if('host_key' in checked[i]){
		 		if(checked[i]['host_key'].substring(0,1)=='.'){
		 			host_key = checked[i]['host_key'].substring(1,checked[i]['host_key'].length)
		 		}else{host_key = checked[i]['host_key']}
		 		Materialize.toast(host_key + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', host_key ,checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
		 		}
		 	if('xattrwherefrom' in checked[i]){
		 		for (var j = 0; j < checked[i]['xattrwherefrom'].length; j++) {	
		 		Materialize.toast(checked[i]['xattrwherefrom'][j] + ' sent to X-Force' , 1000)		 		
		 			Meteor.call('xforce','url', checked[i]['xattrwherefrom'][j],checked[i]['_id'], function(err, data){
		 				Materialize.toast( data, 3000)
		 			})
				}
		 	}

		 	if('host' in checked[i]){
		 		Materialize.toast( checked[i]['host']+ ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['host'],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
		 	if('baseDomain' in checked[i]){
		 		Materialize.toast(checked[i]['baseDomain'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['baseDomain'],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
		 	if('originating_url' in checked[i]){
		 		Materialize.toast(checked[i]['originating_url'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['originating_url'],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
		 	if('scope' in checked[i]){
		 		Materialize.toast(checked[i]['scope'].substring(1,checked[i]['scope'].length) + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['scope'].substring(1,checked[i]['scope'].length),checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
		 	if('LSQuarantineOriginURLString' in checked[i]){
		 		Materialize.toast(checked[i]['LSQuarantineOriginURLString'] + ' sent to X-Force' , 1000)
					Meteor.call('xforce','url', checked[i]['LSQuarantineOriginURLString'],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				}
			if('DownloadEntryURL' in checked[i]){
				Materialize.toast(checked[i]['DownloadEntryURL'] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['DownloadEntryURL'],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
		 	if('redirectURLs' in checked[i]){
		 		for (var j = 0; j < cheked[i]['redirectURLs'].length; j++) {
		 			Materialize.toast(checked[i]['redirectURLs'][j] + ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['redirectURLs'][j],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				};
		 	}

		 	if('origin' in checked[i]){
		 		Materialize.toast(checked[i]['origin']+ ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i]['origin'],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
		 	if("" in checked[i]){
		 		Materialize.toast(checked[i][""]+ ' sent to X-Force' , 1000)
		 			Meteor.call('xforce','url', checked[i][""],checked[i]['_id'],function(err, data){
		 				Materialize.toast( data, 3000)})
				
		 	}
				
		 	}
		 $('#modalAPI').closeModal();
		 var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }

	},
'click .shadow' : function (evt,tmp) {

		checked = Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))},'md5':{'$exists':true}}).fetch()
		Materialize.toast('Sending '+ checked.length + ' MD5s to Shadow Server', 10000)
		for (var i = 0; i < checked.length; i++) {
		if(checked[i].md5)	{
		 Materialize.toast('Sending '+ checked[i].md5 + ' to Shadow Server', 1000)
		 Meteor.call('shadowServerCheck', Session.get('projectID'),checked[i]._id, checked[i].md5)
							}
		}
		$('#modalAPI').closeModal();
		var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
	},
'click .blacklist' : function(evt,tmpl){
		checked = Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))}}).fetch()

		for (var i = 0; i < checked.length; i++) {
		 	if('url' in checked[i]){
	                Materialize.toast('Checking '+ checked[i]['url'] + ' with your Domain Blacklist', 1000)
					Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['url'])
		 		
		 	}else if('referrer' in checked[i]){
		 			Materialize.toast('Checking '+ checked[i]['referrer'] + ' with your Domain Blacklist', 1000)
		 		 	Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['referrer'])

		 	}else if('signon_realm' in checked[i]){
		 			Materialize.toast('Checking '+ checked[i]['signon_realm'] + ' with your Domain Blacklist', 1000)
		 		 	Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['signon_realm'])

		 	}else if('origin' in checked[i]){
		 			Materialize.toast('Checking '+ checked[i]['origin'] + ' with your Domain Blacklist', 1000)
		 		 	Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['origin'])

		 	}else if('host_key' in checked[i]){
		 		if(checked[i]['host_key'].substring(0,1)=='.'){
		 			host_key = checked[i]['host_key'].substring(1,checked[i]['host_key'].length)
		 		}else{host_key= checked[i]['host_key']}
		 			Materialize.toast('Checking '+ host_key + ' with your Domain Blacklist', 1000)
		 		 	Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],host_key)

		 	}
		 	if('xattrwherefrom' in checked[i]){
		 		for (var j = 0; j < checked[i]['xattrwherefrom'].length; j++) {	

		 			Materialize.toast('Checking '+ checked[i]['xattrwherefrom'][j] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['xattrwherefrom'][j])
		 		
		 																		}
		 										}
		 	if('host' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['host']+ ' with your Domain Blacklist', 1000)
					Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['host'])
				
		 	}
		 	if('baseDomain' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['baseDomain'] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['baseDomain'])
				
		 	}
		 	if('originating_url' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['originating_url'] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['originating_url'])
				
		 	}
		 	if('scope' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['scope'].substring(1,checked[i]['scope'].length) + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['scope'].substring(1,checked[i]['scope'].length))
		 	}
		 	if('LSQuarantineOriginURLString' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['LSQuarantineOriginURLString'] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['LSQuarantineOriginURLString'])
		 	}

		 	if('DownloadEntryURL' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['DownloadEntryURL'] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['DownloadEntryURL'])
				
		 	}
		 	if('redirectURLs' in checked[i]){
		 			for (var j = 0; j < cheked[i]['redirectURLs'].length; j++) {
		 				Materialize.toast('Checking '+ checked[i]['redirectURLs'][j] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['redirectURLs'][j])
				}
		 	}

		 	if('origin' in checked[i]){
		 		Materialize.toast('Checking '+ checked[i]['origin'] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i]['origin'])
				
		 	}
		 	if("" in checked[i]){
		 		Materialize.toast('Checking '+ checked[i][""] + ' with your Domain Blacklist', 1000)
		 			Meteor.call('blacklistCheck',Session.get('projectID'), checked[i]['_id'],checked[i][""])
				
		 	}

		 }
		$('#modalAPI').closeModal();
		var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
	},
'click #graph': function (evt, tmpl){
			var predata = Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))}}).fetch()
			var data = []
		for (var i = 0; i < predata.length; i++) {
			if(predata[i].lastVisitedDate || predata[i].DownloadEntryDateAddedKey || predata[i].LSQuarantineTimeStamp || predata[i].creationTime || predata[i].last_visit_date || predata[i].dateAdded || predata[i].timeCreated || predata[i].updateDate || predata[i].installDate || predata[i].visit_date || predata[i].timestamp || predata[i].ctime || predata[i].start_time || predata[i].last_visit_time || predata[i].visit_time || predata[i].date_created || predata[i].last_access_utc || predata[i].last_updated){
				data.push(predata[i])
			}
							}
			
			if(data.length==0 && document.getElementById('chart').style.display == 'none'){
				Materialize.toast( data.length + ' ITEMS WITH DATE', 1000)
				return
			}else{
				Materialize.toast( data.length + ' ITEMS WITH DATE', 1000)
			}

			display = document.getElementById('chart').style.display
			if (display=='none'){
				if (Session.get("ids").length==0){
			 		Materialize.toast('You must have checked items to graph', 10000)
				}else{
				Session.set('ids',[])
				document.getElementById('chart').style.display = ''
				setIds()
					 }
			}
			else{
				document.getElementById('chart').style.display = 'none'
			}
		draw()
	},
'click .virustotal': function(evt,tmpl) {
		 checked = Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))},'md5':{"$exists":true}}).fetch()
		 Materialize.toast(checked.length + ' hashes being sent to VirusTotal', 1000)
		 for (var i = 0; i < checked.length; i++) {
		 	if('md5' in checked[i]){
		 			Materialize.toast(checked[i]['md5'] + ' sent to VirusTotal', 1000)
		 			Meteor.call('virustTotal','md5', checked[i]['md5'],function(err, data){
		 				Materialize.toast( data, 3000)}
		 				)
		 		}
		 }

		 $('#modalAPI').closeModal();
		 var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
	},
	'click .metascan': function(evt,tmpl) {
		 checked = Project.find({'_id':{'$in': convertIdsToObjectID(Session.get('ids'))},'md5':{"$exists":true}}).fetch()
		 Materialize.toast(checked.length + ' hashes being sent to Metascan', 3000)
		 for (var i = 0; i < checked.length; i++) {
		 	if('md5' in checked[i]){
		 			Materialize.toast(checked[i]['md5'] + ' sent to Metascan', 2500)
		 			Meteor.call('metascan','md5', checked[i]['md5'],function(err, data){
		 				Materialize.toast( data, 3000)}
		 				)
		 		}
		 }

		 $('#modalAPI').closeModal();
		 var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
	},
'click .switch' : function(evt,tmpl){
		//uncheck all checkboxes after filter has been clicked
		checkboxes = document.getElementsByClassName('coll') 
		for(var i=0; i < checkboxes.length; i++) {
    		if(checkboxes[i].type == 'checkbox') {
    		  checkboxes[i].checked = false;
 
    		}
    	}
    	document.getElementById('check-all').checked = false
    	Session.set('checked',0)
		if (this.name!='flagged'){
		str = "::"+this.name

		if (Session.get('query').indexOf(str) == -1){
		Session.set("query", Session.get('query') + str)
		}else{
		Session.set('query', Session.get('query').replace(str,''))
		}
	}else{
		if(Session.get('onlyFlagged') == true)
		{
		Session.set('onlyFlagged',false)
		}else
		{
		Session.set('onlyFlagged',true)
		}
	}

	},

  'click .fa-send' :function(ev, tpml){
  	 $('#modalAPI').openModal();
  },
  'click .fa-filter' : function (ev, tmpl){
  	  	 $('#modal1').openModal();

  },
	'click .third-party-results' :function(evt, tmpl){
		oid = new Meteor.Collection.ObjectID(evt.target.id.split('_')[0].trim());
		one = Project.findOne(oid)
		Session.set('thirdparty',evt.target.id.split('_')[1].trim() )
		if (evt.target.id.split('_')[1].trim() == 'metascan'){
			if (one['mt_results'] <= 0){
				Session.set('found',0)
				Session.set('file_info',{'md5': one['md5']})
				Session.set('scan_details', 'Not Found')
			}else{
				Session.set('found',1)
				Session.set('file_info',one['mt_data']['file_info'] )
				console.log(one)
				scan = []
				for (var key in one['mt_data']['scan_details']){
					if (one['mt_data']['scan_details'].hasOwnProperty(key))
					{
						 one['mt_data']['scan_details'][key]['scanner'] = key
						 one['mt_data']['scan_details'][key]['def_time'] = one['mt_data']['scan_details'][key]['def_time'].split('T')[0]
						 scan.push(one['mt_data']['scan_details'][key])
					}
				}
				scan.sort(function(a, b){
					return b.scan_result_i - a.scan_result_i
				})
				Session.set('score',one['mt_results'] + '/' + scan.length)
				Session.set('scan_details',scan)
			}


		
		}else if(evt.target.id.split('_')[1].trim() == 'virustotal'){
				Session.set('found',1)
				Session.set('file_info',{'md5':one['vt_data']['resource'], 'link':one['vt_data']['permalink'], 'scan_date':one['vt_data']['scan_date'] })
				scan = []
				for (var key in one['vt_data']['scans']){
					if (one['vt_data']['scans'].hasOwnProperty(key))
					{
						 one['vt_data']['scans'][key]['scanner'] = key
						 scan.push(one['vt_data']['scans'][key])
					}
				}
				scan.sort(function(a, b){
					return b.detected - a.detected
				})
				Session.set('score',one['vt_data']['positives'] + '/' + one['vt_data']['total'])
				Session.set('scan_details',scan)
			

		}else if (evt.target.id.split('_')[1].trim()  == 'xforceMD5'){
				Session.set('found',1)
				family = ''
				if (one['ibm_malware_family']){
					for (var i = 0; i < one['ibm_malware_family'].length; i++) {
						if (i == one['ibm_malware_family'].length -1){
						family = family + one['ibm_malware_family'][i]

						}else{
						family = family + one['ibm_malware_family'][i] + ','
						}
					};
				}
				Session.set('file_info',{'md5':one['md5'], 'score':one['ibm_md5_results'], 'family':family, 'risk':one['ibm_risk']})
				Session.set('score',one['ibm_md5_results'])
				Session.set('scan_details',0)
			

		}else if (evt.target.id.split('_')[1].trim()  == 'xforceUrl'){
				Session.set('found',1)
				Session.set('file_info',{'url':one['ibm_domain_data']['result']['url']})
				Session.set('score',one['ibm_domain_results'])
				Session.set('scan_details',one['ibm_domain_data']['result'])
			

		}else if (evt.target.id.split('_')[1].trim()  == 'shadow'){
				Session.set('found',1)
				Session.set('file_info',{'md5':one['md5'], 'link': one['shadow_url']})
				Session.set('scan_details', one['shadow_data'])
				Session.set('score',one['shadow_results'])
				

		}else if (evt.target.id.split('_')[1].trim()  == 'blacklist'){
				Session.set('found',1)
				Session.set('file_info',{'url':one['BlackList_Domain'], 'source': one['Black_List_Source']})
				Session.set('scan_details', 0)
				Session.set('score',one['black_list'])
				

		}
		$('#thirdPartyModal').openModal();
	},
	'click .close': function(evt, tmpl){
		$('#thirdPartyModal').closeModal();
	}
	



})

function pageQuery(page){

  if( page == 'Chrome'){
    return '::history::cookies::top_sites::local_storage::login_data::databases::archived_history::web_data::preferences'
  }else if (page == 'Kernal Ext'){
    return ''
  }else if(page == 'Firefox'){
    return '::history::addons::cookies::webapps_store::signons::extension::formhistory::content_prefs::json_files::permissions::health_report::downloads'
  }else if(page == 'Safari'){
    return '::downloads::history::localstorage::databases'
  }else if(page == 'Downloads'){
    return '::email_downloads::downloads::old_email_downloads'
  }else if(page == 'Applications'){
    return '::applications::install_history'
  }else if(page == 'Startup'){
    return '::scripting_additions::login_items::launch_agents'
  }else if(page == 'Accounts'){
    return '::flagged::system_admins::system_users::social_accounts::recent_items'
  }else if(page == 'Mail'){
    return ''
  }else if(page == 'Quarantines'){
    return ''
  }else if(page == 'Flagged'){
    return '::accounts::downloads::startup::mail::quarantines::firefox::applications::safari::kext::chrome'

  }
}

function setIds(){
var chckd = document.getElementsByClassName('coll');
		list = []
		for (var i = chckd.length - 1; i >= 0; i--) {
			if(chckd[i].checked){
				list.push(chckd[i].id)
			}
		}
		Session.set('ids',list)

}

function convertIdsToObjectID(list) {
	// body...
	//convert array of ids to array of objectId
		newlist=[]
		for (var i=0; i<list.length;i++) {
			id = new Meteor.Collection.ObjectID(list[i])
			newlist.push(id)
		}
		return newlist
}


function draw(){

		d3.select('svg').remove()
		var margin = {top: 20, right: 20, bottom: 30, left: 50}
    	var width = document.getElementById('chart').offsetWidth - margin.left - margin.right
  		var height = document.getElementById('chart').offsetHeight - margin.top - margin.bottom
var color = d3.scale.category10()


     

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
var parseDate2 = d3.time.format("%Y-%m-%d").parse;
var parseDate3 = d3.time.format("%Y-%m-%d %H:%M:%S %Z").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.score); });
    
// Adds the svg canvas
var svg = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
// Get the data



var predata = Project.find({ '_id':{'$in': convertIdsToObjectID(Session.get('ids'))}}).fetch()

var data = []
for (var i = 0; i < predata.length; i++) {
	if(predata[i].lastVisitedDate || predata[i].DownloadEntryDateAddedKey || predata[i].LSQuarantineTimeStamp || predata[i].creationTime || predata[i].last_visit_date || predata[i].dateAdded || predata[i].timeCreated || predata[i].updateDate || predata[i].installDate || predata[i].visit_date || predata[i].timestamp || predata[i].ctime || predata[i].start_time || predata[i].last_visit_time || predata[i].visit_time || predata[i].date_created || predata[i].last_access_utc || predata[i].last_updated){
		data.push(predata[i])
	}
										}
    data.forEach(function(d) {
    	if (d.start_time){
        d.date = parseDate(d.start_time)
    	}else if(d.last_visit_time){
    		d.date = parseDate(d.last_visit_time)
    	}else if(d.visit_time){
    		d.date = parseDate(d.visit_time)
    	}else if(d.date_created){
    		d.date = parseDate(d.date_created)
    	}else if(d.last_access_utc){
    		d.date = parseDate(d.last_access_utc)
    	}else if(d.last_updated){
    		d.date = parseDate(d.last_updated)
    	}
    	else if(d.ctime){
    		d.date = parseDate(d.ctime)
    	}else if(d.creationTime)
    		{
        d.date = parseDate(d.creationTime);
  	  		}
    	else if(d.last_visit_date)
    		{
        d.date = parseDate(d.last_visit_date);
  	  		} 
    	else if (d.dateAdded)
    		{
        d.date = parseDate(d.dateAdded);
  	  		}
  	  	else if(d.timeCreated) {
 		d.date = new Date(d.timeCreated)    
  	  		}
  	  	else if(d.updateDate) {
 		d.date = new Date(d.updateDate)    
  	  		}
  	  	else if(d.installDate) {
 		d.date = new Date(d.installDate)    
  	  		}
  	  	else if(d.visit_date)
    		{
        d.date = parseDate(d.visit_date);
  	  		}
  	  	else if(d.timestamp)
    		{
        d.date = parseDate(d.timestamp);
  	  		}
  	  	else if(d.LSQuarantineTimeStamp)
  	  		{
  	  			d.date = parseDate(d.LSQuarantineTimeStamp)
  	  		}
  	  	else if(d.lastVisitedDate)
  	  		{
       		 d.date = parseDate(d.lastVisitedDate)
  	    	}
  	    else if (d.DownloadEntryDateAddedKey) {
  	  		d.date = parseDate3(d.DownloadEntryDateAddedKey)
  	    }		  		
        tempscore=0
        if (d.black_list)
        {
        	tempscore += d.black_list
        }
        if (d.vt_results){
        	tempscore += d.vt_results
        }
        if(d.ibm_domain_results){
        	
        	tempscore += d.ibm_domain_results
        }
        if (d.shadow_results)
        {
        	tempscore += d.shadow_results
        }if(d.ibm_md5_results){
        	
        	tempscore += d.ibm_md5_results
        }

		d.score = +tempscore
	    
	    })

    
    // Scale the range of the data
     x.domain(d3.extent(data, function(d) { return d.date; }));
    // x.domain([parseDate2(Session.get('downloadsDateStart')),parseDate2(Session.get('endDate')) ])
    y.domain([ d3.min(data, function (d) {return d.score})-1, d3.max(data, function(d) {return d.score})+1]);

    

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
      .enter().append("svg:foreignObject")
        .attr("x", function(d) { return x(d.date) })
        .attr("y", function(d) {return y(d.score) })
        .attr('opacity','0.5')
        .attr('color',function(d){if(d.score > 0){return '#ef5350'}else{return '#66bb6a'}})
        .attr('size' ,function(d){return '1em'})
        .html(function (d) {
        	if (d.osxcollector_section == 'chrome') {
        					if(d.referrer)		{url = String(d.referrer).substring(0,15)}
        					else if (d.url)		{url=String(d.url).substring(0,15)}
        					else if (d.host_key)	{url=String(d.host_key).substring(0,15)} 
        					else if (d.origin)	{url=String(d.origin).substring(0,15)} 	
        					else if (d.siginon_realm)	{url=String(d.signon_realm).substring(0,15)};	
        	label = url
			icon = 'chrome'
		}else if(d.osxcollector_section == 'firefox'){
							if(d.referrer)		{url = String(d.referrer).substring(0,15)}
        					else if (d.url)		{url=String(d.url).substring(0,15)}
        					else if (d.host)	{url=String(d.host).substring(0,15)}
        					else if (d.baseDomain)		{url=String(d.baseDomain).substring(0,15)}
        					else if (d.scope)	{url=String(d.scope).substring(0,15)} 
			icon ='firefox'
			label = url	

		}else if(d.osxcollector_section == 'safari'){
							if(d.DownloadEntryURL)		{url = String(d.DownloadEntryURL).substring(0,15)}
        					else if (d.origin)		{url=String(d.origin).substring(0,15)}
        					else if (d[""])	{url=String(d[""]).substring(0,15)}
			icon = 'safari'
			label = url	
		}
		else if(d.osxcollector_section == 'downloads'){
			icon = 'download'
			label = d.file_path	
		}
		else if(d.osxcollector_section == 'accounts'){
			icon = 'user'
			label = d.realname	
		}
		else if(d.osxcollector_section == 'mail'){
			icon = 'envelope'
			label = d.xattrwherefrom	
		}
		else if(d.osxcollector_section == 'quarantines'){
			icon ='exclamation-triangle'
			label = d.LSQuarantineAgentBundleIdentifier	
		}
		else{
			icon = 'apple'
			label = d.osxcollector_section	
		}




        				return '<i class="fa fa-' + icon + ' tooltipped" data-position-"bottom" data-delay="50" data-tooltip="Score: ' + d.score + ' ' + label + ' ' + String(d.date).substring(0,16)  + '"></i>' })
   
    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Date");

      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Total Score")
      
      $(document).ready(function(){
    $('.tooltipped').tooltip({delay: 50});
  });

}

function interate(ob) {
	  var list = []
	  var index = 0
	  var doc = ob
	 _(doc).each( function( value, key, doc) {
	 	
	        list[index] = {};
	        list[index]['value'] = value;
	        list[index]['key'] = key;
	    		
	        index++;
	    });
	 console.log(list)
	    return list;
}