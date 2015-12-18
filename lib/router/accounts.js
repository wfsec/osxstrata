Router.route('/project/:osxcollector_incident_id/accounts', {
	name: 'sectionAccounts',
  subscriptions: function (){
          Meteor.subscribe('accounts',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
          Meteor.subscribe('accounts-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'),Session.get('begDate'),Session.get('endDate'))
  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Accounts',
      separator: '|'
    }}
})