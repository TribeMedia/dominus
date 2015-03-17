var os = Npm.require('os');
var landingConn = DDP.connect(process.env.DOMINUS_BASE);

// register server and game with dominus base
// dominus_key makes sure it's one of my servers
Meteor.startup(function() {
    if (process.env.DOMINUS_BASE && process.env.GAME_ID && process.env.DOMINUS_KEY) {
        registerWithServer();
        Meteor.setTimeout(function() {
            registerWithServer();
        }, 1000*60*10);
    }
});

var registerWithServer = function() {
    console.log('--- registering with home base');

    // TODO: find a better way to get the ip of the host from inside a docker container
    HTTP.get('http://api.ipify.org', {timeout:1000*60}, function(error, result) {
        if (error) {
            console.error(error);
        } else {
            var ip = result.content;

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
                os.cpus()
            );
        }
    });
};
