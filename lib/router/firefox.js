Router.route('/project/:osxcollector_incident_id/firefox', {
	name: 'sectionFirefox',
  subscriptions: function (){
          Meteor.subscribe('firefox',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
          Meteor.subscribe('firefox-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged')) 

  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Firefox',
      separator: '|'
    }}
})