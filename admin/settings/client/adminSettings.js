Template.adminSettings.helpers({
	gameStartDate: function() {
		var setting = Settings.findOne({name:'gameStartDate'});
		if (setting) {
			return setting.value;
		}
	},

	gameEndDate: function() {
		var setting = Settings.findOne({name:'gameEndDate'});
		if (setting) {
			return setting.value;
		}
	},

	lastDominusUserId: function() {
		var setting = Settings.findOne({name:'lastDominusUserId'});
		if (setting) {
			return setting.value;
		}
	},

	isGameOver: function() {
		var setting = Settings.findOne({name:'isGameOver'});
		if (setting) {
			return setting.value;
		}
	},

	gameOverDate: function() {
		var setting = Settings.findOne({name:'gameOverDate'});
		if (setting) {
			return setting.value;
		}
	},

	gameResetDate: function() {
		var setting = Settings.findOne({name:'gameResetDate'});
		if (setting) {
			return setting.value;
		}
	},

	hasGameOverAlertBeenSent: function() {
		var setting = Settings.findOne({name:'hasGameOverAlertBeenSent'});
		if (setting) {
			return setting.value;
		}
	},

	winner: function() {
		var setting = Settings.findOne({name:'winner'});
		if (setting) {
			return setting.value;
		}
	},

	playerCount: function() {
		var setting = Settings.findOne({name:'playerCount'});
		if (setting) {
			return setting.value;
		}
	},

	villageCount: function() {
		var setting = Settings.findOne({name:'villageCount'});
		if (setting) {
			return setting.value;
		}
	},

	taxesCollected: function() {
		var setting = Settings.findOne({name:'taxesCollected'});
		if (setting) {
			return setting.value;
		}
	},
})


Template.adminSettings.events({
	'click #gameStartDateButton': function(event, template) {
		var input = template.find('.formInput');
		console.log($(input).val());
	}
})


Template.adminSettings.onCreated(function() {
	this.subscribe('adminSettings');
})