

Template.sectionQuarantines.helpers({
	
	quarantines: function () {
		return  Project.find({'osxcollector_section': 'quarantines', 'osxcollector_incident_id':Session.get('projectID')}, {sort: {checked: -1, flagged: -1}})

   },
   quarantinesCount: function () { 
   return Counts.get('quarantines-counter')
   },
	curText : function () {
		var max = Counts.get('quarantines-counter')
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
		return Session.get('quarantineDateStart')
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
		}else if (rslts >1){
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
	findname : function (file_path) {
	var x = file_path.lastIndexOf('_') + 1
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
	scoreCheck : function (bl,vt,ibm_domain,ibm_md5,sh){
		if(bl === undefined && ibm_domain === undefined && ibm_md5 === undefined && sh === undefined && vt === undefined){
			return '#90a4ae'
		}
		if(sh === undefined){
			sh = 0
		}
		if(vt === undefined){
			vt = 0
		}
		if(ibm_md5 === undefined){
			ibm_md5 = 0
		}
		if(ibm_domain === undefined){
			ibm_domain = 0
		}
		if(bl === undefined){
			bl = 0
		}
		score = sh + vt + ibm_md5 + ibm_domain[0].score + bl
		if (score > 0)
			{return '#ef5350'}
		else
			{return '#66bb6a'}

	
	}

})



Template.sectionQuarantines.events({
	'click .all-the-way' : function (evt,tmpl){
		if (Counts.get('quarantines-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('quarantines-counter'))
		{
			Session.set('next',true)
		}
		Session.set('skipcursor',0)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)		
	},
	'click .next' :function (evt,tmpl) {
		if (Counts.get('quarantines-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('quarantines-counter'))
		{
			Session.set('next',false)
		}

		Session.set('skipcursor', Number(Session.get('skipcursor') + Session.get('showResults')))
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'click .previous' :function (evt,tmpl) {
		if (Counts.get('quarantines-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('quarantines-counter'))
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
		var leftover = Counts.get('quarantines-counter') % Session.get('showResults')
		Session.set('skipcursor', Counts.get('quarantines-counter') - leftover)
		Session.set('next',false)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'change #startDate' : function (evt,tmpl) {
		Meteor.call('checkAllQuarantines',Session.get('projectID'),Session.get('quarantineDateStart'),Session.get('dateEnd'),false)
		Session.set('checkAll',false)
		var startDate  = tmpl.find('#startDate').value
		Session.set('quarantineDateStart',startDate)

	},
	'change #endDate' : function (evt,tmpl) {
		Meteor.call('checkAllQuarantines',Session.get('projectID'),Session.get('quarantineDateStart'),Session.get('dateEnd'),false)		
		Session.set('checkAll',false)
		var endDate  = tmpl.find('#endDate').value
		Session.set('dateEnd',endDate)

	},
	

})

