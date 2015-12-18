Router.route('/project/:osxcollector_incident_id/startup', {
	name: 'sectionStartup',
  subscriptions: function (){
          Meteor.subscribe('startup',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
          Meteor.subscribe('startup-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Startup',
      separator: '|'
    }}
})
