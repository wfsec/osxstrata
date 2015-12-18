
// Session.setDefault('next',true)
// Session.setDefault('skipcursor',0)

// Session.set("query",'::accounts::downloads::startup::mail::quarantines::firefox::applications::safari::kext::chrome')

// Session.setDefault('showResults',25)

// Session.setDefault('checked',0)

Template.sectionFlagged.helpers({
	
	flagged: function () {
	return Project.find({"osxcollector_incident_id":Session.get('projectID'),'flagged':true},{limit:Session.get('showResults')})
   },
	curText : function () {
		var max = Counts.get('flagged-counter')
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
	countChecked: function (){
		return Session.get('checked')
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
	sectionCheck: function (section){
		if (section == 'chrome') {
			return 'chrome'
		}else if(section == 'firefox'){
			return 'firefox'

		}else if(section == 'safari'){
			return 'safari'
		}
		else if(section == 'downloads'){
			return 'download'
		}
		else if(section == 'accounts'){
			return 'user'
		}
		else if(section == 'mail'){
			return 'envelope'
		}
		else if(section == 'quarantines'){
			return 'exclamation-triangle'
		}
		else{
			return 'apple'
		}

	},
	scoreCheck : function (sh,vt,ibm_md5,ibm_domain,bl){
		if(sh === undefined && ibm_md5 === undefined && ibm_domain === undefined && vt === undefined && bl === undefined){
			return '#90a4ae'
		}
		if(bl === undefined){
			bl = 0
		}
		if(vt === undefined){
			vt = 0
		}
		if(ibm_domain === undefined){
			ibm_domain = 0
		}
		if(sh === undefined){
			sh = 0
		}
		if(ibm_md5 === undefined){
			ibm_md5 = 0
		}
		if(typeof(ibm_domain) === 'object'){
			ibm_domain = ibm_domain[0].score
		}
		score = bl + vt + ibm_domain+ sh + ibm_md5
		if (score > 0)
			{return '#ef5350'}
		else
			{return '#66bb6a'}

	
	}

})


Template.sectionFlagged.events({
	'click .all-the-way' : function (evt,tmpl){
		if (Counts.get('flagged-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('flagged-counter'))
		{
			Session.set('next',true)
		}
		Session.set('skipcursor',0)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'click .next' :function (evt,tmpl) {
		if (Counts.get('flagged-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('flagged-counter'))
		{
			Session.set('next',false)
		}

		Session.set('skipcursor', Number(Session.get('skipcursor') + Session.get('showResults')))
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'click .previous' :function (evt,tmpl) {
		if (Counts.get('flagged-counter')- (Session.get('skipcursor') + Session.get('showResults'))  < Session.get('showResults') || Session.get('showResults') == Counts.get('flagged-counter'))
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
		var leftover = Counts.get('flagged-counter') % Session.get('showResults')
		Session.set('skipcursor', Counts.get('flagged-counter') - leftover)
		Session.set('next',false)
		document.getElementById('check-all').checked = false
		Session.set('checked',0)
	},
	'change #startDate' : function (evt,tmpl) {
		Meteor.call('checkAllFlagged',Session.get('projectID'),Session.get('dateStart'),Session.get('dateEnd'),false)
		Session.set('checkAll',false)
		var startDate  = tmpl.find('#startDate').value
		Session.set('dateStart',startDate)

	},
	'change #endDate' : function (evt,tmpl) {
		Meteor.call('checkAllFlagged',Session.get('projectID'),Session.get('dateStart'),Session.get('dateEnd'),false)		
		Session.set('checkAll',false)
		var endDate  = tmpl.find('#endDate').value
		Session.set('dateEnd',endDate)

	}
	
	
	


})

