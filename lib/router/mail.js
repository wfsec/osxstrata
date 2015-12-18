Router.route('/project/:osxcollector_incident_id/mail', {
	name: 'sectionMail',
  subscriptions: function (){
    Meteor.subscribe('mail',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get('onlyFlagged'))
    Meteor.subscribe('mail-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get('onlyFlagged'))

  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Mail',
      separator: '|'
    }}
})
