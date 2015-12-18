Router.route('/project/:osxcollector_incident_id/chrome', {
	name: 'sectionChrome',
  subscriptions: function (){
    Meteor.subscribe('chrome',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'),Session.get('begDate'),Session.get('endDate'))
    Meteor.subscribe('chrome-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'),Session.get('begDate'),Session.get('endDate') ) 
    },
	  seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Chrome',
      separator: '|'
    }}
	
})