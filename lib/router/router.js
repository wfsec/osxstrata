
Router.configure({
  layoutTemplate: 'layout',
  // loadingTemplate: 'loading',
  // notFoundTemplate: 'notFound',
  // waitOn: function() { return Meteor.subscribe('project'); }
})
Router.route('/signin',{name: 'signin',
seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Sign In',
      separator: '|'
    }}})

// Router.route('/upload',{name: 'customUpload',
// 	seo: {
//     title: {
//       text: 'OSX Strata',
//       suffix: 'Upload',
//       separator: '|'
//     }}
// })

Router.route('/', {
  name: 'projectsList',
  waitOn: function (){
    Meteor.subscribe('project')
    Meteor.subscribe('all-flagged')
    Meteor.subscribe('the-counts')
    
  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'ProjectList',
      separator: '|',
    }
}
})

Router.route('/project/:osxcollector_incident_id', {
	name: 'project',
  subscriptions: function () {
    Meteor.subscribe('system_info',Session.get('projectID'))

  },
	seo: {
    title: {
      text: 'OSX Strata',
      suffix: ':osxcollector_incident_id',
      separator: '|'
    }}
	
})




Router.route('/settings', {
  name: 'settings',
  waitOn: function () {
    Meteor.subscribe('settings')
    Meteor.subscribe('users')
  },
 
  seo: {
    title: {
      text: 'OSX Strata',
      suffix: 'Settings',
      separator: '|'
    }}
  
})









