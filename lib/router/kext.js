Router.route('/project/:osxcollector_incident_id/kext', {
	name: 'sectionKext',
  subscriptions: function (){
    Meteor.subscribe('kext', Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get('onlyFlagged'))
    Meteor.subscribe('kext-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get('onlyFlagged')) 

  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Kernal Ext',
      separator: '|'
    }}
	
})