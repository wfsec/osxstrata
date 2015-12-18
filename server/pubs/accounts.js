Meteor.publish('accounts-counter', function (id,skip,limit,filter,flagged) {
	if (flagged==false){
		query = sectionQueryBuilder(filter,'sub')
		var cursor = Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':id,"$or":query})
		Counts.publish(this, 'accounts-counter',cursor,{noReady: true})
	}else if(flagged == true && filter==""){
		var cursor = Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':id,'flagged':true})
		Counts.publish(this, 'accounts-counter',cursor,{noReady: true})
	}else{
		query = sectionQueryBuilder(filter,'sub')
		var cursor = Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':id,"$or":query,'flagged':true})
		Counts.publish(this, 'accounts-counter',cursor,{noReady: true})
	}

})

Meteor.publish('accounts', function (id,skip,limit,filter,flagged) {
	if (flagged==false){
		query = sectionQueryBuilder(filter,'sub')
		return Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':id,"$or":query}, {limit: limit,skip: skip})
	}else if (flagged==true && filter==""){
		return Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':id,'flagged':true}, {limit: limit,skip: skip})
	}else if(flagged == true && filter!=""){
		query = sectionQueryBuilder(filter,'sub')
		return Project.find({'osxcollector_section':'accounts','osxcollector_incident_id':id,"$or":query,'flagged':true}, {limit: limit,skip: skip})

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