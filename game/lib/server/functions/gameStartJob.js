Cue.addJob('checkForGameStart', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
    checkForGameStart();
    done();
});


var checkForGameStart = function() {
	
}


var startGame = function() {
	
}