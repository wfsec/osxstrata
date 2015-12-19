

Template.customUpload.created = function() {
  Uploader.init(this);
}

Template.customUpload.rendered = function () {
  Uploader.render.call(this);
};

Template.customUpload.events({
  'click .start': function (e) {
    Uploader.startUpload.call(Template.instance(), e);
    $('#modalUpload').closeModal()
    var overlays = document.getElementsByClassName("lean-overlay");
    for (i = 0; i < overlays.length; i++) {
      overlays[i].style.display = 'none';
    }
  }
  
});

Template.customUpload.helpers({
  'infoLabel': function() {
    var instance = Template.instance();

    // we may have not yet selected a file
    var info = instance.info.get()
    if (!info) {
      return;
    } 
    var progress = instance.globalInfo.get();

    // we display different result when running or not
    return progress.running ?
      info.name + ' - ' + progress.progress + '% - [' + progress.bitrate + ']' :
      info.name + ' - ' + info.size/1000000 + 'MB';
  },
  'progress': function() {
    return Template.instance().globalInfo.get().progress + '%';
  }
})

Meteor.startup(function() {
  Uploader.finished = function(index, fileInfo, templateContext) {
    $('#modalUpload').closeModal()
    if(document.getElementById('anly').checked){
  Meteor.call('importJson','.uploads/tmp' + fileInfo.path, true, function (error, result) { 
   if(!error){
        Materialize.toast(fileInfo.name.toUpperCase() + ' UPLOADED and ANALIZED',10000)

   } } )
    }else{
   Meteor.call('importJson','.uploads/tmp' + fileInfo.path, false, function (error, result) { 
   if(!error){
        Materialize.toast(fileInfo.name.toUpperCase() + ' UPLOADED',10000)

   } } )
    }
    Router.go('/', {name: 'projectList'});

  }
})
