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
	},

	admin_setGameEndDate: function(date, time) {
		var m = moment(date+' '+time);
		if (m.isValid()) {
			Settings.upsert({name:'gameEndDate'}, {$set: {name:'gameEndDate', value:m.toDate()}});
			//setGameInfo({startDate:m.toDate()});
		} else {
			console.error('error saving end date');
		}
	},

	admin_setGameOverDate: function(date, time) {
		var m = moment(date+' '+time);
		if (m.isValid()) {
			Settings.upsert({name:'gameOverDate'}, {$set: {name:'gameOverDate', value:m.toDate()}});
			//setGameInfo({startDate:m.toDate()});
		} else {
			console.error('error saving game over date');
		}
	},

	admin_setGameResetDate: function(date, time) {
		var m = moment(date+' '+time);
		if (m.isValid()) {
			Settings.upsert({name:'gameResetDate'}, {$set: {name:'gameResetDate', value:m.toDate()}});
			//setGameInfo({startDate:m.toDate()});
		} else {
			console.error('error saving game reset date');
		}
	},
});
