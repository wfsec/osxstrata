Template.signin.events({
        'submit form': function(event) {
            event.preventDefault();
        	var USERNAME = event.target.username.value;
        	var PASSWORD = event.target.acountPassword.value;
            Meteor.loginWithPassword(USERNAME, PASSWORD, function(err,data){
                if (err){
                 Materialize.toast('WRONG USERNAME/PASSWORD Try Again!!',8000)
                }
                else{
                Materialize.toast('WELCOME TO STRATA '+ USERNAME.toUpperCase() ,8000)
                Router.go('/')

                }

            }

                )
           
        }
    });