Router.route('/project/:osxcollector_incident_id/applications', {
	name: 'sectionApplications',
  subscriptions: function (){
          Meteor.subscribe('applications',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
          Meteor.subscribe('applications-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged')) 
       
  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Applications',
      separator: '|'
    }}
})