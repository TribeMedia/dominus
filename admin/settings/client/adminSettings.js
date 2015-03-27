Template.adminSettings.helpers({

	gameName: function() {
		var setting = Settings.findOne({name:'gameName'});
		if (setting) {
			return setting.value;
		}
	},

	gameDescription: function() {
		var setting = Settings.findOne({name:'gameDescription'});
		if (setting) {
			return setting.value;
		}
	},

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
	'click #gameNameButton': function(event, template) {
		var input = template.find('#gameNameInput');
	},

	'click #gameDescriptionButton': function(event, template) {
		var input = template.find('#gameDescriptionInput');
	},

	'click #gameStartDateButton': function(event, template) {
		var dateInput = template.find('#gameStartDateInput');
		var timeInput = template.find('#gameStartTimeInput');
		Meteor.call('admin_setGameStartDate', dateInput.value, timeInput.value);
	}
})


Template.adminSettings.onCreated(function() {
	this.subscribe('adminSettings');
})