var defaults = {
  title: 'OSX Strata',                 // Will apply to <title>, Twitter and OpenGraph.

  description: 'OSX Collector UI',        // Will apply to meta, Twitter and OpenGraph.
     
};

Router.plugin('seo', defaults);
Template.projectsList.helpers({
	
	projectName: function () {
		return  Project.find({"projectID":{"$exists":true}})


	}
	,
   
   flaggedCount: function (osxcollector_incident_id) { 
      return Project.find({'osxcollector_incident_id':osxcollector_incident_id,'flagged':true}).count().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  
   },
  counts: function (){
    return BigCounts.find({})
  },
  commas: function (count){
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  },
  project: function(){
    return Session.get('deleteProject')
  }

	
})

Template.projectsList.events({
	'click .listed-project': function (evt, tmpl) {
		Session.set('projectID', this.projectID)
	  Session.set('activePage','Project')
      Session.set('next',true)
      Session.set('skipcursor',0)
      Session.set("query",'')
      Session.set('onlyFlagged',true)
      Session.set('showResults',25)
      Session.set('checked',0)

	},
  'click .fa-trash': function (ev, tmpl){
    $('#modalDeleteCollection').openModal()
    Session.set('deleteProject',ev.target.id)
  },
  'click #deleteTheProject': function(ev, tmpl){

    Meteor.call('deleteCollection', Session.get('deleteProject'),function(err,data){
      if(data){
      Materialize.toast(Session.get('deleteProject') + ' Collection Deleted: ' + data + ' entries removed', 5000)
              }
    })
    $('#modalDeleteCollection').closeModal()
  }

})