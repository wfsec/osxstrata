Router.route('/project/:osxcollector_incident_id/flagged', {
	name: 'sectionFlagged',
  subscriptions: function (){
          Meteor.subscribe('projectFlagged',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"))
          Meteor.subscribe('flagged-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"))

  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Flagged',
      separator: '|'
    }}
})