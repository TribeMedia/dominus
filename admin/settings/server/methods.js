Meteor.methods({

	admin_setGameName: function(name) {
		Settings.upsert({name:'gameName'}, {$set: {name:'gameName', value:name}});
		setGameInfo({name:name});
	},

	admin_setGameDescription: function(description) {
		Settings.upsert({name:'gameDescription'}, {$set: {name:'gameDescription', value:description}});
		setGameInfo({description:description});
	},

	admin_setGameStartDate: function(date, time) {
		var m = moment(date+' '+time);
		if (m.isValid()) {
			Settings.upsert({name:'gameStartDate'}, {$set: {name:'gameStartDate', value:m.toDate()}});
			setGameInfo({startDate:m.toDate()});
		} else {
			console.error('error saving start date');
		}
	}
});
