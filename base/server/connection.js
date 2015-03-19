landingConnection = DDP.connect(process.env.DOMINUS_BASE);


callLandingMethod = function(methodName, email, options) {
    if (landingConnection.status().connected) {
        Meteor.defer(function() {
            landingConnection.call(methodName, process.env.DOMINUS_KEY, email, process.env.GAME_ID, options);
        });
    } else {
        console.error('no connection to base');
    }
};
