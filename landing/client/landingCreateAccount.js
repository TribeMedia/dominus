Template.landingCreateAccount.helpers({
	gameIsFull: function() {
		return Session.get('gameIsFull');
	}
});

Template.landingCreateAccount.events({
	'click #landingSigninLink': function(event, template) {
		event.preventDefault();
		Session.set('landingForm', 'landingSignin');
	}
});
