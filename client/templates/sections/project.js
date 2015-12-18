Session.set('activePage','Project')
      
Template.project.helpers({
	
	system_info : function (id) {
		return Project.find({'osxcollector_section':'system_info', 'osxcollector_incident_id':Session.get('projectID')})
	},
	projectId: function () {
		return Session.get('projectID')
	},
	iter: function() {
	  var list = []
	  var index = 0
	  var doc = this
	 _(doc).each( function( value, key, doc) {
	    	if(key != '_id' && key != 'osxcollector_incident_id' && key != 'osxcollector_section' && key != 'flagged' && key != 'checked'){
	        list[index] = {};
	        list[index]['value'] = value;
	        list[index]['key'] = key;
	    		}
	        index++;
	    });
	    return list;

	}


})