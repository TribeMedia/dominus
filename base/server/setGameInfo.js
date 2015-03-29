var tries = 0;
var maxTries = 30;

// info is any of {gameName:'name', gameDescription:'desc', startDate: date}
setGameInfo = function(info) {
    if (landingConnection.status().connected) {

        var data = {};

        landingConnection.call('setGameInfo', process.env.GAME_ID, process.env.DOMINUS_KEY, info);

    } else {

        tries++;

        if (tries < maxTries) {
            Meteor.setTimeout(function() {
                setGameInfo(info);
            }, 1000);
        }
    }
};
