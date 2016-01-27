Template.sectionSafari.helpers({
	
	safari: function () {
		return  Project.find({'osxcollector_section': 'safari', 'osxcollector_incident_id':Session.get('projectID')})

   },
   safariCount: function () { 
   return Counts.get('safari-counter')
   },
	curText : function () {
		var max = Counts.get('safari-counter')
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
		return Session.get('safariDateStart')
	},
	endDate : function () {
		return Session.get('dateEnd')
	},
	 showNext: function () {
	 	return Session.get('next')
	 },
	checkResultsLabels : function (rslts) {
		if (rslts == -1){
			return 'label-success'
		}
		else if(rslts == 0){
			return 'label-info'
		} 
		else if (rslts == 1){
			return 'label-warning'
		}else if (rslts == 2){
			return 'label-danger'
		}else
		{ return 'label-default'}
	},
	checkResultsLabelsShadow : function (rslts) {
		if (rslts == -1){
			return 'label-success'
		}
		else if(rslts == 0){
			return 'label-info'
		} 
		else if (rslts == 1){
			return 'label-warning'
		}else
		{ return 'label-default'}
	},
	checkResultsLabelsIBM : function (rslts) {
		
		if (rslts == -1){
			return 'label-info'
		}
		else if(rslts == 0){
			return 'label-success'
		} 
		else if (rslts >= 1 && rslts <= 5){
			return 'label-warning'
		}else if (rslts > 5){
			return 'label-danger'
		}else
		{ return 'label-default'}
	},
	countChecked: function (){
		return Session.get('checked')
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
	scoreCheck : function (bl,vt,ibm){
		if(ibm === undefined && vt === undefined && bl === undefined){
			return '#90a4ae'
		}
		if(bl === undefined){
			bl = 0
		}
		if(vt === undefined){
			vt = 0
		}
		if(ibm === undefined){
			ibm = 0
		}
		score = bl + vt + ibm
		if (score > 0)
			{return '#ef5350'}
		else
			{return '#66bb6a'}

	
	}

})



Template.sectionSafari.events({
	'click .all-the-way' : function (evt,tmpl){
		if (Counts.get('safari-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('safari-counter'))
		{
			Session.set('next',true)
		}
		Session.set('skipcursor',0)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)		
	},
	'click .next' :function (evt,tmpl) {
		if (Counts.get('safari-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('safari-counter'))
		{
			Session.set('next',false)
		}

		Session.set('skipcursor', Number(Session.get('skipcursor') + Session.get('showResults')))
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'click .previous' :function (evt,tmpl) {
		if (Counts.get('safari-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('safari-counter'))
		{
			Session.set('next',true)
		}
		if (Number(Session.get('skipcursor')) > (Session.get('showResults')-1)){
					Session.set('skipcursor', Number(Session.get('skipcursor') - Session.get('showResults')))
		}
		document.getElementById('check-all').checked = false
		Session.set('checked',0)		
	},
	'click .to-the-end': function (evt,tmpl) {
		var leftover = Counts.get('safari-counter') % Session.get('showResults')
		Session.set('skipcursor', Counts.get('safari-counter') - leftover)
		Session.set('next',false)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'change #startDate' : function (evt,tmpl) {
		Meteor.call('checkAllSafari',Session.get('projectID'),Session.get('safariDateStart'),Session.get('dateEnd'),false)
		Session.set('checkAll',false)
		var startDate  = tmpl.find('#startDate').value
		Session.set('safariDateStart',startDate)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'change #endDate' : function (evt,tmpl) {
		Meteor.call('checkAllSafari',Session.get('projectID'),Session.get('safariDateStart'),Session.get('dateEnd'),false)		
		Session.set('checkAll',false)
		var endDate  = tmpl.find('#endDate').value
		Session.set('dateEnd',endDate)

	}



})
