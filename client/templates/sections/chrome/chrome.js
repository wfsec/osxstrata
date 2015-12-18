
Template.sectionChrome.helpers({
	
	chrome: function () {
		return  Project.find({'osxcollector_section': 'chrome', 'osxcollector_incident_id':Session.get('projectID')})

   },
   chromeCount: function () {
 
 	return Counts.get('chrome-counter')
   },
	curText : function () {
		var max = Counts.get('chrome-counter')
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
		return Session.get('chromeDateStart')
	},
	endDate : function () {
		return Session.get('dateEnd')
	},
	
	
	 showNext: function () {
	 	return Session.get('next')
	 },
	checkResultsLabels : function (rslts) {
		if (rslts == 2){
			return 'label-success'
		}
		else if(rslts == 1){
			return 'label-info'
		} 
		else if (rslts == -1){
			return 'label-warning'
		}else if (rslts == -2){
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
		if(typeof(rslts)==='object'){
			rslts = rslts[0].score
		}
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
	trimresults: function (results){
		return results.substring(0,20) + '...'
	},
	findname : function (filePath) {
	var x = filePath.lastIndexOf('/') + 1
		return filePath.substring(0,20) + '...'
	},
	iter: function() {
	  var list = []
	  var index = 0
	  var doc = this
	 _(doc).each( function( value, key, doc) {
	 	if(key == 'ibm_domain_results'){
	 		newval=''
	 			for (var i = 0; i < value.length; i++) {
	 				newval += "{ DOMAIN: " + value[i]['domain'] + " RATING: " + value[i]['score'] + ' DESCRIPTION: ' + value[i]['ibm_descriptions'] + ' ASSOCIATED URL: ' + value[i]['associated_url'] + '} '
	 			};

	 		list[index] = {};
	        list[index]['value'] = newval;
	        list[index]['key'] = key;
	    }
	    	else if(key != '_id' && key != 'osxcollector_incident_id' && key != 'flagged'){
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
		score = bl + vt + ibm[0].score
		if (score > 0)
			{return '#ef5350'}
		else
			{return '#66bb6a'}

	
	}

})



Template.sectionChrome.events({
	'click .all-the-way' : function (evt,tmpl){
		if (Counts.get('chrome-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('chrome-counter'))
		{
			Session.set('next',true)
		}
		Session.set('skipcursor',0)
	   	Session.set('checked',0)

	},
	'click .next' :function (evt,tmpl) {
		if (Counts.get('chrome-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('chrome-counter'))
		{
			Session.set('next',false)
		}

		Session.set('skipcursor', Number(Session.get('skipcursor') + Session.get('showResults')))
		Session.set('checked',0)

	},
	'click .previous' :function (evt,tmpl) {
		if (Counts.get('chrome-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('chrome-counter'))
		{
			Session.set('next',true)
		}
		if (Number(Session.get('skipcursor')) > (Session.get('showResults')-1)){
					Session.set('skipcursor', Number(Session.get('skipcursor') - Session.get('showResults')))
		}
		Session.set('checked',0)

	},
	'click .to-the-end': function (evt,tmpl) {
		var leftover = Counts.get('chrome-counter') % Session.get('showResults')
		Session.set('skipcursor', Counts.get('chrome-counter') - leftover)
		Session.set('next',false)
		Session.set('checked',0)


	},
	'change #startDate' : function (evt,tmpl) {
		Meteor.call('checkAllChrome',Session.get('projectID'),Session.get('chromeDateStart'),Session.get('dateEnd'),false)
		Session.set('checkAll',false)
		var startDate  = tmpl.find('#startDate').value
		Session.set('chromeDateStart',startDate)

	},
	'change #endDate' : function (evt,tmpl) {
		Meteor.call('checkAllChrome',Session.get('projectID'),Session.get('chromeDateStart'),Session.get('dateEnd'),false)		
		Session.set('checkAll',false)
		var endDate  = tmpl.find('#endDate').value
		Session.set('dateEnd',endDate)

	},

	'click #modal1': function(evt,tmpl){
		$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year
    format: 'yyyy-mm-dd'

  });
	},
	'change #begDate': function(evt,tmpl){
		Session.set('begDate',document.getElementById('begDate').value)
	},
	'change #endDate': function(evt,tmpl){
		Session.set('endDate',document.getElementById('endDate').value)
	}


})

