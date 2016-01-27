/* Need to Add other integrations (Virustotal and Metascan) to update as well just need a unlimited licsense for it to be feaseable*/ 
SyncedCron.add({
  name: 'Updating the BlackList',
  schedule: function(parser) {
   crondate =  Settings.find({'cronBlacklist':true}).fetch()
    return parser.text(crondate[0]['date_string']);
  },
  job: function() {
    return Meteor.call('updateBlacklist');
  }
});

// This can be uncommented if you want. This is meant to update hashes in case a hash is run and nothing is found but later it IBM determines it as malware. Problem with signature based analysis. 
// I ran this against 10,000 hashes and it took 96 minutes, we had 140k hashes at that time so it would have taken just under a day to update them all

// SyncedCron.add({
//   name: 'Updating the Hashes with Xforce',
//   schedule: function(parser) {
//     return parser.text('every 3 mins');
//   },
//   job: function() {     
//     console.log(Meteor.call('updateHashes'))

//     return 'fin';
//   }
// });

