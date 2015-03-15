Meteor.methods({

    // TODO: still needs security
    pullNewCode: function() {
        var gameId = process.env.GAME_ID;
        var tempDir = '/temp/pull';
        var appDir = '/opt/dominus';

        var exec = Npm.require('child_process').exec;

        var cmd = '/bin/bash /home/dan/meteor/dominus/base/.scripts/pullNewCode '+gameId+' '+tempDir+' '+appDir;

        var child = exec(cmd, function(error, stdout, stderr) {
            console.log('stdout: '+stdout);
            console.log('stderr: '+stderr);

            if (error !== null) {
                console.log('exec error: '+error);
            }

        });
    }
});
