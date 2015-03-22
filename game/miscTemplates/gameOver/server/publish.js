Meteor.publish('isGameOver', function() {
    return Settings.find({name:'isGameOver'});
});

Meteor.publish('gameOverDate', function() {
    return Settings.find({name:'gameOverDate'});
});

Meteor.publish('winner', function() {
    return Settings.find({name:'winner'});
});
