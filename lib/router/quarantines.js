Router.route('/project/:osxcollector_incident_id/quarantines', {
	name: 'sectionQuarantines',
  subscriptions: function (){
    Meteor.subscribe('quarantines',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get('onlyFlagged'))
    Meteor.subscribe('quarantines-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get('onlyFlagged'))
   },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Quarantines',
      separator: '|'
    }}
})