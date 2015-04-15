Template.landingSignin.events({
	'click #landingCreateAccountLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingCreateAccount')
	},

	'click #landingForgotPasswordLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingForgotPassword')
	},
})