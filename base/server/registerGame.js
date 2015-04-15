var tries = 0;
var maxTries = 30;

Meteor.startup(function() {
    registerGame();

    // pass DOMINUS_BASE to client
    // insert into settings
    // this is used for links
    Settings.upsert({name:'dominusBase'}, {$set: {name:'dominusBase', value:process.env.DOMINUS_BASE}});
});

registerGame = function() {
    if (landingConnection.status().connected) {
        console.log('--- registering game with '+process.env.DOMINUS_BASE);

        var hasEnded = false;
        var setting = Settings.findOne({name: 'isGameOver'});
        if (setting) {
            hasEnded = setting.value;
        }

        var gameName = process.env.GAME_ID;
        setting = Settings.findOne({name: 'gameName'});
        if (setting) {
            gameName = setting.value;
        }

        var gameDescription = 'New game.';
        setting = Settings.findOne({name: 'gameDescription'});
        if (setting) {
            gameDescription = setting.value;
        }

        var numPlayers = Meteor.users.find().count();

        var startDate= null;
        setting = Settings.findOne({name: 'gameStartDate'});
        if (setting) {
            startDate = setting.value;
        }

        var maxPlayers = s.serverMaxPlayers;

        landingConnection.call(
            'registerGame',
            process.env.GAME_ID,
            process.env.DOMINUS_KEY,
            numPlayers,
            startDate,
            hasEnded,
            maxPlayers,
            gameName,
            gameDescription
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
