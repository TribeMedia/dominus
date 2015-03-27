Template.landingCreateAccount.helpers({
	serverAtMaxPlayers: function() {
		var numPlayers = Settings.findOne({name:'playerCount'})
		if (numPlayers) {
			if (numPlayers.value >= s.serverMaxPlayers) {
				return true
			}
		}
	}
})

Template.landingCreateAccount.events({
	'click #landingSigninLink': function(event, template) {
		event.preventDefault()
		Session.set('landingForm', 'landingSignin')
	}
})