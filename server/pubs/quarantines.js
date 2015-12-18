Meteor.publish('quarantines-counter', function (id,skip,limit,flagged) {
	if (flagged==false){
		var cursor = Project.find({'osxcollector_section':'quarantines','osxcollector_incident_id':id})
		Counts.publish(this, 'quarantines-counter',cursor,{noReady: true})
	}else if (flagged==true){
		var cursor = Project.find({'osxcollector_section':'quarantines','osxcollector_incident_id':id,'flagged':true})
		Counts.publish(this, 'quarantines-counter',cursor,{noReady: true})
	}})

Meteor.publish('quarantines', function (id,skip,limit,flagged) {
	if (flagged==false){
		return Project.find({'osxcollector_section':'quarantines','osxcollector_incident_id':id}, {limit: limit,skip: skip})
	}else if (flagged==true){
		return Project.find({'osxcollector_section':'quarantines','osxcollector_incident_id':id,'flagged':true}, {limit: limit,skip: skip})
	}})

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