Template.landingForgotPassword.events({
	'click #landingCreateAccountLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingCreateAccount')
	},

	'click #landingSigninLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingSignin')
	}
})