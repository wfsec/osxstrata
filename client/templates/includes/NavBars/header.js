Template.header.helpers({
	username : function(){
		return Meteor.user()['username']
	}



})
Template.header.rendered = function (tmpl) {
	

$(document).ready(function(){
    $('.modal-trigger').leanModal();
	 $('select').material_select();
    $('.button-collapse').sideNav({
      menuWidth: 240, // Default is 240
      edge: 'left', // Choose the horizontal origin
      // closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    })
});
}

Template.header.events({
	'click #home': function(evt,tmpl){
		Session.set('activePage','')
	      Session.set('next',true)
	      Session.set('skipcursor',0)
	      Session.set("query",'')
	      Session.set('onlyFlagged',true)
	      Session.set('showResults',25)
	      Session.set('checked',0)
	      Session.set('projectID','')

	},
	'click .signout' : function(evt,tmpl){
		AccountsTemplates.logout();
		Router.go('/signin')
	},
	'click .brand-logo' : function (evt,tmpl){
	  Session.set('activePage','')
      Session.set('next',true)
      Session.set('skipcursor',0)
      Session.set("query",'')
      Session.set('onlyFlagged',true)
      Session.set('showResults',25)
      Session.set('checked',0)

	},
	'click .button-collapse': function(evt,tmpl){
  $('.button-collapse').sideNav('show');

},
	'click .fa-th-large': function(evt, tmpl){
		Router.go('/settings')
	},
	'click .fa-upload': function (evt, tmpl){

	$('#modalUpload').openModal();

	}


})