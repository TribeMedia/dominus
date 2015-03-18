var os = Npm.require('os');
landingConn = null;

// register server and game with dominus base
// dominus_key makes sure it's one of my servers
Meteor.startup(function() {
    if (process.env.DOMINUS_BASE && process.env.GAME_ID && process.env.DOMINUS_KEY) {

        landingConn = DDP.connect(process.env.DOMINUS_BASE);

        registerServer();
        Meteor.setInterval(function() {
            registerServer();
        }, 1000*60*10);
    }
});

var registerServer = function() {
    console.log('--- registering server with '+process.env.DOMINUS_BASE);

    // TODO: find a better way to get the ip of the host from inside a docker container
    HTTP.get('http://api.ipify.org', {timeout:1000*60}, function(error, result) {

        if (error) {
            console.error(error);

        } else {
            var ip = result.content;

            if (landingConn.status().connected) {

                landingConn.call(
                    'registerServer',
                    process.env.GAME_ID,
                    process.env.BRANCH_ID,
                    process.env.DOMINUS_WORKER,
                    process.env.DOMINUS_KEY,
                    ip,
                    os.uptime(),
                    os.loadavg(),
                    os.totalmem(),
                    os.freemem(),
                    os.cpus(),
                    s.version
                );

            } else {
                console.error('not connected to home base');
                console.error(landingConn.status());
                landingConn.reconnect();
            }
        }
    });
};
