Meteor.publish('flagged-counter', function (id,skip,limit,filter) {
	query = sectionQueryBuilder(filter,'section')
	cursor = Project.find({'osxcollector_incident_id':id,'flagged':true,"$or":query})
	Counts.publish(this, 'flagged-counter',cursor,{noReady: true})
})

Meteor.publish('projectFlagged', function (id,skip,limit,filter) {
	query = sectionQueryBuilder(filter,'section')
	return Project.find({'osxcollector_incident_id':id,'flagged':true,"$or":query}, {limit: limit,skip: skip})

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