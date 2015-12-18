Meteor.publish('kext-counter', function (id,skip,limit,flagged) {
	if (flagged==false){
		var cursor = Project.find({'osxcollector_section':'kext','osxcollector_incident_id':id})
		Counts.publish(this, 'kext-counter',cursor,{noReady: true})
	}else if (flagged==true){
		var cursor = Project.find({'osxcollector_section':'kext','osxcollector_incident_id':id,'flagged':true})
		Counts.publish(this, 'kext-counter',cursor,{noReady: true})
	}})


Meteor.publish('kext', function (id,skip,limit,flagged) {
	if (flagged==false){
		return Project.find({'osxcollector_section':'kext','osxcollector_incident_id':id}, {limit: limit,skip: skip})
	}else if (flagged==true){
		return Project.find({'osxcollector_section':'kext','osxcollector_incident_id':id,'flagged':true}, {limit: limit,skip: skip})
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