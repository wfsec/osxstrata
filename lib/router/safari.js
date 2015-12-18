Router.route('/project/:osxcollector_incident_id/safari', {
	name: 'sectionSafari',
  subscriptions: function (){
    Meteor.subscribe('safari',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
    Meteor.subscribe('safari-counter',Session.get('projectID'),Session.get('skipcursor'),Session.get('showResults'),Session.get("query"),Session.get('onlyFlagged'))
  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Safari',
      separator: '|'
    }}  

})