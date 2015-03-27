var tries = 0;
var maxTries = 30;

Meteor.startup(function() {
    registerGame();
});

var registerGame = function() {
    if (landingConnection.status().connected) {
        console.log('--- registering game with '+process.env.DOMINUS_BASE);

        var hasEnded = false;
        var setting = Settings.findOne({name: 'isGameOver'});
        if (setting) {
            hasEnded = setting.value;
        }

        var numPlayers = Meteor.users.find().count();

        var startDate = s.game_start_date;

        var maxPlayers = s.serverMaxPlayers;

        landingConnection.call(
            'registerGame',
            process.env.GAME_ID,
            process.env.DOMINUS_KEY,
            numPlayers,
            startDate,
            hasEnded,
            maxPlayers
        );

    } else {

        tries++;

        if (tries < maxTries) {
            Meteor.setTimeout(function() {
                registerGame();
            }, 1000);
        }
    }
};