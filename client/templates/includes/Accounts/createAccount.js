Template.createAccount.events({
        'submit form': function(event) {
            event.preventDefault();
        	var USERNAME = event.target.username.value;
        	var passwordVar = event.target.acountPassword.value;
            var passwordVar1 = event.target.acountPassword1.value;
            if(passwordVar == passwordVar1){
            Meteor.call('createAccount', USERNAME, passwordVar, function (err, data){
            	Materialize.toast(USERNAME + ' account created',5000)
            })
            }else{
                Materialize.toast("PASSWORDS DON'T MATCH",5000)
            }

           $('#modalAdd').closeModal()
        }
    });
