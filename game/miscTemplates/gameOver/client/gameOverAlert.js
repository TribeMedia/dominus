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


Template.gameOverAlert.events({
    'click #gameOverUserLink': function(event, template) {
        var self = this

        var setting = Settings.findOne({name:'winner'});
        if (setting) {
            var winner = setting.value;

            if (winner) {
                Meteor.call('coords_to_id', winner.x, winner.y, 'hex', function(error, hexId) {
                    if (!error && hexId) {
                        center_on_hex(winner.x, winner.y);
                        Session.set('selected_type', 'hex');
                        Session.set('selected_id', hexId);
                        Session.set('selected_coords', {x:winner.x, y:winner.y})
                    }
                });
            }
        }
    }
})


Template.gameOverAlert.onCreated(function() {
    this.subscribe('isGameOver');
    this.subscribe('gameOverDate');
    this.subscribe('winner');
});
