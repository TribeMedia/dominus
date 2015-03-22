Cue.addJob('checkForGameOver', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
    checkForGameOver();
    done();
});

checkForGameOver = function() {
    var end = Settings.findOne({name: 'gameEndDate'});
    if (end && end.value !== null) {
        var endDate = moment(end.value);
        if (endDate) {
            if (moment().isAfter(endDate)) {

                // has alert already been sent
                var hasBeenSent = Settings.findOne({name:'hasGameOverAlertBeenSent'});
                if (!hasBeenSent || !hasBeenSent.value) {

                    // find who won
                    var winner = Meteor.users.findOne({is_dominus:true}, {fields:{_id:1, emails:1, username:1}});
                    if (!winner) {

                        // if nobody is currently dominus see who was last dominus
                        var lastDominus = Settings.findOne({name: 'lastDominusUserId'});
                        if (lastDominus && lastDominus.value) {
                            winner = Meteor.users.findOne(lastDominus.value, {fields:{_id:1, emails:1}});
                        }
                    }

                    if (winner) {
                        gameOver(winner);

                    } else {
                        console.error('Game is over but no dominus found.');
                    }
                }
            }
        }
    }
};


var gameOver = function(winner) {
    gAlert_gameOver(winner._id);
    Settings.upsert({name: 'hasGameOverAlertBeenSent'}, {$set: {name: 'hasGameOverAlertBeenSent', value:true}});
    Settings.upsert({name: 'isGameOver'}, {$set: {name: 'isGameOver', value:true}});
    Settings.upsert({name: 'gameOverDate'}, {$set: {name: 'gameOverDate', value:new Date()}});

    var winnerData = {
        _id:winner._id,
        username:winner.username,
        x:winner.x,
        y:winner.y,
        castle_id:winner.castle_id
        };

    Settings.upsert({name: 'winner'}, {$set: {name: 'winner', value:winnerData}});

    // update profile
    var options = {};
    callLandingMethod('profile_wonGame', winner.emails[0].address, options);

    // let home base know that game is over
    landingConnection.call('gameHasEnded', process.env.GAME_ID, process.env.DOMINUS_KEY);



    // ------------------------------
    // record results
    var results = {};

    results.winner = {
        username:winner.username,
        email:winner.emails[0].address
    };

    // num vassals
    results.numVassals = [];
    var rank = 1;
    Meteor.users.find({}, {sort:{num_allies_below:-1}, fields:{emails:1, username:1, num_allies_below:1}, limit:10}).forEach(function(user) {
        var player = {
            username:user.username,
            rank:rank,
            email:user.emails[0].address,
            numVassals: user.num_allies_below
        };
        results.numVassals.push(player);
        rank++;
    });

    // by networth
    results.networth = [];
    rank = 1;
    Meteor.users.find({}, {sort:{"net.total": -1}, fields:{emails:1, username:1, "net.total":1}, limit:10}).forEach(function(user) {
        var player = {
            username:user.username,
            rank:rank,
            email:user.emails[0].address,
            networth: user.net.total
        };
        results.networth.push(player);
        rank++;
    });

    // by income
    results.income = [];
    rank = 1;
    Meteor.users.find({}, {sort:{income: -1}, fields:{emails:1, username:1, income:1}, limit:10}).forEach(function(user) {
        var player = {
            username:user.username,
            rank:rank,
            email:user.emails[0].address,
            income:income
        };
        results.income.push(player);
        rank++;
    });

    // by lostSoldiers
    results.lostSoldiers = [];
    rank = 1;
    Meteor.users.find({}, {sort:{losses_worth: -1}, fields:{emails:1, username:1, losses_worth:1, losses_num:1}, limit:10}).forEach(function(user) {
        var player = {
            username:user.username,
            rank:rank,
            email:user.emails[0].address,
            lostSoldiersWorth:losses_worth,
            lostSoldiersNum:losses_num
        };
        results.lostSoldiers.push(player);
        rank++;
    });

    // by villages
    results.villages = [];
    rank = 1;
    Villages.find({under_construction:false}, {sort:{"income.worth": -1}, fields:{emails:1, username:1, "income.worth":1}, limit:10}).forEach(function(village) {

        var player = {
            username:village.username,
            rank:rank,
            villageWorth:village.income.worth
        };

        var u = Meteor.users.findOne(village.user_id, {fields:{emails:1}});
        if (u) {
            player.email = u.emails[0].address;
        }

        results.lostSoldiers.push(player);
        rank++;
    });

    landingConnection.call('addResultsFromGame', process.env.GAME_ID, process.env.DOMINUS_KEY, results);
};
