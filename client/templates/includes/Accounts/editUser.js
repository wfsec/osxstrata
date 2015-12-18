Template.editUser.events({
        'submit form': function(event) {
            event.preventDefault();
            var oldPassword = event.target.oldPassword.value;
            var passwordVar = event.target.acountPassword.value;
            var passwordVar1 = event.target.acountPassword1.value;
            if(passwordVar == passwordVar1){
            Meteor.call('changeUserPassword', oldPassword, passwordVar, function (err, data){
                if (err){
                Materialize.toast('Something went wrong password not updated',5000)
                }else{
             Materialize.toast(Meteor.user()['username'] + ' password updated',5000)
  
             }
            })
            }else{
                Materialize.toast("PASSWORDS DON'T MATCH",5000)
            }

           $('#modalEditUser').closeModal()
        }
    });
