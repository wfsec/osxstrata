

Template.sectionFirefox.helpers({
	
	firefox: function () {
		return  Project.find({'osxcollector_section':'firefox','osxcollector_incident_id':Session.get('projectID')})

   },
   firefoxCount: function () { 
   return Counts.get('firefox-counter')
   },
	curText : function () {
		var max = Counts.get('firefox-counter')
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
		return Session.get('firefoxDateStart')
	},
	endDate : function () {
		return Session.get('dateEnd')
	},
	 showNext: function () {
	 	return Session.get('next')
	 },
	checkResultsLabels : function (rslts) {
		if(rslts == -1){
			return 'label-success'
		} 
		else if (rslts == 1){
			return 'label-warning'
		}else if (rslts == 2){
			return 'label-danger'
		}else
		{ return 'label-default'}
	},
	checkResultsLabelsIBM : function (rslts) {
	max=0
		if (typeof(rslts)!= 'number'){
			for (var i = 0; i < rslts.length; i++) {
				if (rslts[i]['score'] > max){
					max = rslts[i]['score']
				}
			};
			rslts = max
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
	findname : function (file_path) {
	var x = file_path.lastIndexOf('/') + 1
		return file_path.substring(x)
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


Template.sectionFirefox.events({
	'click .all-the-way' : function (evt,tmpl){
		if (Counts.get('firefox-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('firefox-counter'))
		{
			Session.set('next',true)
		}
		Session.set('skipcursor',0)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'click .next' :function (evt,tmpl) {
		if (Counts.get('firefox-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('firefox-counter'))
		{
			Session.set('next',false)
		}

		Session.set('skipcursor', Number(Session.get('skipcursor') + Session.get('showResults')))
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'click .previous' :function (evt,tmpl) {
		if (Counts.get('firefox-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('firefox-counter'))
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
		var leftover = Counts.get('firefox-counter') % Session.get('showResults')
		Session.set('skipcursor', Counts.get('firefox-counter') - leftover)
		Session.set('next',false)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'change #startDate' : function (evt,tmpl) {
		Meteor.call('checkAllFirefox',Session.get('projectID'),Session.get('firefoxDateStart'),Session.get('dateEnd'),false)
		Session.set('checkAll',false)
		var startDate  = tmpl.find('#startDate').value
		Session.set('firefoxDateStart',startDate)

	},
	'change #endDate' : function (evt,tmpl) {
		Meteor.call('checkAllFirefox',Session.get('projectID'),Session.get('firefoxDateStart'),Session.get('dateEnd'),false)		
		Session.set('checkAll',false)
		var endDate  = tmpl.find('#endDate').value
		Session.set('dateEnd',endDate)

	}


})

