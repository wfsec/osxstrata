

Meteor.publish('project', function () {
	return Project.find({"projectID":{"$exists":true}},{"$hints":{"projectID":1}})
})

Meteor.publish('all-flagged' , function () {
	return Project.find({'flagged':true},{"hints":{'flagged':true}})
})


Meteor.publish('system_info', function (id) {
	return Project.find({'osxcollector_section':'system_info','osxcollector_incident_id':id})
})
Meteor.publish('flagged', function (id) {
	

	return [
			Project.find({'osxcollector_incident_id':id}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true}),
			Project.find({'osxcollector_incident_id':id,flagged: true})

			]
})

Meteor.publish('the-counts', function (){
  return BigCounts.find({})
})

Meteor.publish('flagged-count', function () {
			Counts.publish(this, 'flagged-count', Project.find({"flagged": true},{nonReactive: true}))


})
Meteor.publish('hash-count', function () {
			Counts.publish(this, 'hash-count', Hashes.find({},{nonReactive: true}))


})

Meteor.publish('blacklist-count', function () {
			Counts.publish(this, 'blacklist-count', Domains.find({},{nonReactive: true}))


})
Meteor.publish('grand-total', function () {
			Counts.publish(this, 'grand-total', Project.find({},{nonReactive: true}))


})
//these 2 publications give the total and flagged counts for the sideNav

Meteor.publish('total-counts', function (id) {
	Counts.publish(this, 'kext-total-count', Project.find({'osxcollector_section':'kext','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'startup-total-count', Project.find({'osxcollector_section':'startup','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'applications-total-count', Project.find({'osxcollector_section':'applications','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'quarantines-total-count', Project.find({'osxcollector_section':'quarantines','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'downloads-total-count', Project.find({'osxcollector_section':'downloads','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'chrome-total-count', Project.find({'osxcollector_section':'chrome','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'firefox-total-count', Project.find({'osxcollector_section':'firefox','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'safari-total-count', Project.find({'osxcollector_section':'safari','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'accounts-total-count', Project.find({'osxcollector_section':'accounts','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})
	Counts.publish(this, 'mail-total-count', Project.find({'osxcollector_section':'mail','osxcollector_incident_id': id},{"$hints":{
      "osxcollector_section" : 1,
      "osxcollector_incident_id" : 1
    }}),{nonReactive: true})

})


Meteor.publish('total-flagged-counts', function (id) {
	Counts.publish(this,'kext-flagged-count', Project.find({'osxcollector_section':'kext','osxcollector_incident_id': id, flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'startup-flagged-count', Project.find({'osxcollector_section':'startup','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'applications-flagged-count', Project.find({'osxcollector_section':'applications','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'quarantines-flagged-count', Project.find({'osxcollector_section':'quarantines','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'downloads-flagged-count', Project.find({'osxcollector_section':'downloads','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'chrome-flagged-count', Project.find({'osxcollector_section':'chrome','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'firefox-flagged-count', Project.find({'osxcollector_section':'firefox','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'safari-flagged-count', Project.find({'osxcollector_section':'safari','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'accounts-flagged-count', Project.find({'osxcollector_section':'accounts','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))
	Counts.publish(this,'mail-flagged-count', Project.find({'osxcollector_section':'mail','osxcollector_incident_id': id,flagged: true},{'$hints':{
      "osxcollector_incident_id" : 1,
      "osxcollector_section" : 1,
      "flagged" : true
    }}))


})

function sectionQueryBuilder(str,section){
	var sep = str.split('::')
	list = []
	for (var i = sep.length - 1; i >= 1; i--) {
		if(section=='sub'){
		list.push({"osxcollector_subsection":sep[i]})
		}else{
		list.push({"osxcollector_section":sep[i]})

		}
	}
	return list
}
// Meteor.publish('error-counts', function (id) {
// 	return Import_Errors.find({})
// })

