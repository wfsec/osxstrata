Meteor.publish('settings', function () {
	return Settings.find({})
})
Meteor.publish('users', function (){
	return Meteor.users.find({})

})
Meteor.publish('api_settings', function(){
	return Settings.find({api_key_setting:true})
})