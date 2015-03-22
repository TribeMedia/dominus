Template.gameOverAlert.helpers({
    show: function() {
        var setting = Settings.findOne({name:'isGameOver'});
        if (setting && setting.value) {
            return true;
        }
    }
});


Template.gameOverAlert.onCreated(function() {
    this.subscribe('isGameOver');
    this.subscribe('gameOverDate');
    this.subscribe('winner');
});
