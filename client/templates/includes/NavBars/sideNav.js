Session.setDefault('activePage','Project')


Template.sideNav.helpers({
  	projectId: function () {
		return Session.get('projectID') 
							},
	waitOn: function () {
		Meteor.subscribe('total-counts',Session.get('projectID'))
		Meteor.subscribe('total-flagged-counts',Session.get('projectID'))

	},
	count: function (tmpl) {
		return Counts.get('kext-total-count') + Counts.get('startup-total-count') + Counts.get('applications-total-count') + Counts.get('quarantines-total-count') + Counts.get('downloads-total-count') + Counts.get('chrome-total-count') + Counts.get('safari-total-count') + Counts.get('firefox-total-count') + Counts.get('accounts-total-count') + Counts.get('mail-total-count') + Counts.get('system-info-total-count') 
	},
  project : function () {
    return Session.get('projectID').substring(0,12) + '...'
  },
   flaggedCount: function () { 
   			var counts = 0
   			counts += Counts.get('kext-flagged-count')
   			counts += Counts.get('startup-flagged-count')
   			counts += Counts.get('applications-flagged-count')
   			counts += Counts.get('quarantines-flagged-count')
   			counts += Counts.get('downloads-flagged-count')
   			counts += Counts.get('chrome-flagged-count')
   			counts += Counts.get('firefox-flagged-count')
   			counts += Counts.get('safari-flagged-count')
   			counts += Counts.get('accounts-flagged-count')
   			counts += Counts.get('mail-flagged-count')
   			counts += Counts.get('system-info-flagged-count')
   			Session.set('flaggedCount',counts)
   return counts
   }
   ,
   active : function(id){
    target = Session.get('activePage')
    if(target == id){
    return ' active '}
    else{return ' '}
   },
  commas: function (count){
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

   
})



Template.sideNav.events({
   'click .sideNav': function(evt,tmpl){
      target = evt.target.innerHTML
      Session.set('activePage',target)
      Session.set('next',true)
      Session.set('skipcursor',0)
      Session.set("query",pageQuery(target))
      Session.set('onlyFlagged',false)
      Session.set('showResults',25)
      Session.set('checked',0)
      Session.set('ids',[])
      Session.set('begDate','2000-01-01')
      Session.set('endDate','2100-01-01')

 }

})

function pageQuery(page){

  if( page == 'Chrome'){
    return '::history::cookies::top_sites::local_storage::login_data::databases::archived_history::web_data::preferences'
  }else if (page == 'Kernal Ext'){
    return ''
  }else if(page == 'Firefox'){
    return '::history::addons::cookies::webapps_store::signons::extension::formhistory::content_prefs::json_files::permissions::health_report::downloads'
  }else if(page == 'Safari'){
    return '::downloads::history::localstorage::databases'
  }else if(page == 'Downloads'){
    return '::email_downloads::downloads::old_email_downloads'
  }else if(page == 'Applications'){
    return '::applications::install_history'
  }else if(page == 'Startup'){
    return '::scripting_additions::login_items::launch_agents'
  }else if(page == 'Accounts'){
    return '::flagged::system_admins::system_users::social_accounts::recent_items'
  }else if(page == 'Mail'){
    return ''
  }else if(page == 'Quarantines'){
    return ''
  }else if(page == 'Flagged'){
    return '::accounts::downloads::startup::mail::quarantines::firefox::applications::safari::kext::chrome'

  }
}

