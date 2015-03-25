Template.gameOverAlert.helpers({
    show: function() {
        var setting = Settings.findOne({name:'isGameOver'});
        if (setting && setting.value) {
            return true;
        }
    },

    winner: function() {
    	return Settings.findOne({name:'winner'});
    },

    gameOverDate: function() {
    	var gameOverDate = Settings.findOne({name:'gameOverDate'});
    	if (gameOverDate) {
    		return gameOverDate.value;
    	}
    }
});


Template.gameOverAlert.onCreated(function() {
    this.subscribe('isGameOver');
    this.subscribe('gameOverDate');
    this.subscribe('winner');
});
