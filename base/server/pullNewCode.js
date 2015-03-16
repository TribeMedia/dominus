Meteor.methods({

    // TODO: still needs security
    pullNewCode: function() {
        var branchId = process.env.BRANCH_ID;

        var exec = Npm.require('child_process').exec;

        var cmd = '/bin/bash /pullNewCode.sh '+branchId;

        var child = exec(cmd, function(error, stdout, stderr) {
            console.log('stdout: '+stdout);
            console.log('stderr: '+stderr);

            if (error !== null) {
                console.log('exec error: '+error);
            }

        });
    }
});
