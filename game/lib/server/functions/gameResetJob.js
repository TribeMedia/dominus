// this happens after someone has won and game has been over for some time
// reset database
// stop cue
// close registration and login
// send reminder to admin

Cue.addJob('checkForGameReset', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
    checkForGameReset();
    done();
});


var checkForGameReset = function() {
	
}


var resetGame = function() {
	Cue.stop();
	Cue.dropTasks();

	// wait to make sure tasks are done
	Meteor.setTimeout(function() {
		Cue.resetStats();
		Meteor.users.remove({});
		Dailystats.remove({});
		Gamestats.remove({});
		Battles.remove({});
		Fights.remove({});
		Hexes.remove({});
		Castles.remove({});
		Armies.remove({});
		Villages.remove({});
		Moves.remove({});
		Hexbakes.remove({});
		Settings.remove({});	// should this be removed?
		Charges.remove({});
		Alerts.remove({});
		GlobalAlerts.remove({});
		Rooms.remove({});
		Roomchats.remove({});
		Recentchats.remove({});
		Forums.remove({});
		Threads.remove({});
		Messages.remove({});
		Latestmessages.remove({});
		Markethistory.remove({});
		Market.remove({});
	}, 1000*60*5);
}