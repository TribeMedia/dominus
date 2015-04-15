Meteor.publish('gameStartDate', function() {
	return Settings.find({name:'gameStartDate'});
});

Meteor.publish('gameName', function() {
	return Settings.find({name:'gameName'});
});

Meteor.publish('gameDescription', function() {
	return Settings.find({name:'gameDescription'});
});

Meteor.publish('dominusBase', function() {
	return Settings.find({name:'dominusBase'});
});
