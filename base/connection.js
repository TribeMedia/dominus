landingConnection = DDP.connect(Meteor.settings.public.baseUrl);


if (Meteor.isServer) {
    callLandingMethod = function(methodName, email, options) {
        if (landingConnection.status().connected) {
            Meteor.defer(function() {
                landingConnection.call(methodName, process.env.DOMINUS_KEY, email, process.env.GAME_ID, options);
            });
        } else {
            console.error('no connection to base when calling method '+methodName);
        }
    };
}
