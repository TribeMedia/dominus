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
    console.log(getIp());
    landingConn.call(
        'registerServer',
        process.env.GAME_ID,
        process.env.BRANCH_ID,
        process.env.DOMINUS_WORKER,
        process.env.DOMINUS_KEY,
        getIp(),
        os.uptime(),
        os.loadavg(),
        os.totalmem(),
        os.freemem(),
        os.cpus()
    );
};


var getIp = function() {
    // Get interfaces
    var netInterfaces = os.networkInterfaces();
    // Result
    var result = [];
    for (var id in netInterfaces) {
        var netFace = netInterfaces[id];

        for (var i = 0; i < netFace.length; i++) {
            var ip = netFace[i];
            if (ip.internal === false && ip.family === 'IPv4') {
                result.push(ip);
            }
        }
    }
    return result;
};
