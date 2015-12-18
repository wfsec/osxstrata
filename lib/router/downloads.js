Router.route('/project/:osxcollector_incident_id/downloads', {
	name: 'sectionDownloads',
  subscriptions: function (){
    Meteor.subscribe('downloads',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
    Meteor.subscribe('downloads-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged') ) 

  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Downloads',
      separator: '|'
    }}
	
})