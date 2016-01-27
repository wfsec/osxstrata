

Template.sectionAccounts.helpers({
	accounts: function () {
		return  Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':Session.get('projectID')})

   },
   accountsCount: function () { 
   return Counts.get('accounts-counter')
   },
	curText : function () {
		var max = Counts.get('accounts-counter')
		if (Session.get('skipcursor') + Session.get('showResults') > max){
			return (Session.get('skipcursor')+' - ' + max)
			}		
		else if (Number(Session.get('skipcursor')) > (Session.get('showResults')-1)) {
			return (Session.get('skipcursor'))+' - ' + (Session.get('skipcursor') + Session.get('showResults'))
													}

			else {
			return ('0 - ' + Session.get('showResults'))
													}
	},
	startDate : function () {
		return Session.get('dateStart')
	},
	endDate : function () {
		return Session.get('dateEnd')
	},
	 showNext: function () {
	 	return Session.get('next')
	 },
	checkResultsLabels : function (rslts) {
		if(rslts == 1){
			return 'label-success'
		} 
		else if (rslts == -1){
			return 'label-danger'
		}else
		{ return 'label-info'}
	},
	findname : function (file_path) {
	var x = file_path.lastIndexOf('/') + 1
		return file_path.substring(x)
	},
	iter: function() {
	  var list = []
	  var index = 0
	  var doc = this
	 _(doc).each( function( value, key, doc) {
	    	if(key != '_id' && 
	 			key != 'osxcollector_incident_id' && 
	 			key != 'flagged' && 
	 			key != 'osxcollector_section' &&
	 			key != 'BlackList_Domain' && 
	 			key != 'Black_List_Source' &&
	 			key != 'black_list' &&
	 			key != 'ibm_domain_results' &&
	 			key != 'ibm_domain_data' &&
	 			key != 'ibm_malware_family' &&
	 			key != 'ibm_md5_results' &&
	 			key != 'ibm_risk' &&
	 			key != 'shadow_url' &&
	 			key != 'shadow_data' &&
	 			key != 'shadow_results' &&
	 			key != 'vt_results' &&
	 			key != 'vt_data' &&
	 			key != 'mt_data' &&
	 			key != 'mt_results' &&
	 			key != 'vt_scan_date' 
	 			){
	        list[index] = {};
	        list[index]['value'] = value;
	        list[index]['key'] = key;
	    		}
	        index++;
	    });
	    return list;

	},
	countChecked: function (){
		return Session.get('checked')
	}
	

})


Template.sectionAccounts.events({
	'click .all-the-way' : function (evt,tmpl){
		if (Counts.get('accounts-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('accounts-counter'))
		{
			Session.set('next',true)
		}
		Session.set('skipcursor',0)
	},
	'click .next' :function (evt,tmpl) {
		if (Counts.get('accounts-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('accounts-counter'))
		{
			Session.set('next',false)
		}

		Session.set('skipcursor', Number(Session.get('skipcursor') + Session.get('showResults')))

	},
	'click .previous' :function (evt,tmpl) {
		if (Counts.get('accounts-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('accounts-counter'))
		{
			Session.set('next',true)
		}
		if (Number(Session.get('skipcursor')) > (Session.get('showResults')-1)){
					Session.set('skipcursor', Number(Session.get('skipcursor') - Session.get('showResults')))
		}
	},
	'click .to-the-end': function (evt,tmpl) {
		var leftover = Counts.get('accounts-counter') % Session.get('showResults')
		Session.set('skipcursor', Counts.get('accounts-counter') - leftover)
		Session.set('next',false)

	}
	
})

