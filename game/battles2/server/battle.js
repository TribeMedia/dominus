Cue.addJob('runBattle', {retryOnError:false, maxMs:1000*60*8}, function(task, done) {
  var battle = new BattleJob(task.data.x, task.data.y);
  battle.runBattle();
  done()
})


BattleJob = function(x, y) {
  this.x = x;
  this.y = y;

  // filled in when run
  this.currentRound = null;
  this.battleData = null;
}


BattleJob.prototype.runBattle = function() {
  var self = this;

  // check for a battle going on here
  // this returns the document before it is modified (isRunning is set)
  self.battleData = Battles2.findAndModify({
    query: {x:self.x, y:self.y, isOver:false},
    update: {$set:{isRunning:true}}
  });

  // if found a battle
  if (self.battleData) {

    // abort if already running
    if (self.battleData.isRunning) {
      return;
    }

    // make sure it's past time to do battle
    var cutoff = moment().subtract(s.battle_interval, 'ms').toDate();
    var battleDate = moment(new Date(self.battleData.updatedAt));
    if (battleDate.isAfter(cutoff)) {

      // abort if battle was too recent
      Battles2.update(self.battleData._id, {$set: {isRunning:false}});
      return;
    } else {

      // battle is a go!
      self.battleData.roundNumber++;
    }
  } else {

    // create new battle
    self.battleData = {
      x:self.x,
      y:self.y,
      isRunning:true,
      createdAt:new Date(),
      updatedAt:new Date(),
      roundNumber:1,
      isOver:false,
      loses:[],

      // list of armies who were in battle previously to this round
      // used to figure out who to send entered battle alert to
      unitsFromPreviousRounds:[]
    }

    // insert so that isRunning is true
    self.battleData._id = Battles2.insert(self.battleData);
  }

  self.currentRound = new BattleRound();

  self.gatherData();
  self.currentRound.run();
  self.processBattleResults();
  self.saveRound();
  self.saveBattle();
}



BattleJob.prototype.processBattleResults = function() {
  var self = this;

  _.each(self.currentRound.armies, function(army) {

    var inc = {};
    _.each(s.army.types, function(type) {
      inc[type] = army.loses[type] * -1;
    })

    switch(army.unitType) {
      case 'castle':

        if (army.destroyed) {
          // give castle away
          if (army.becameVassalOf_userId) {
            var lord = Meteor.users.findOne(army.becameVassalOf_userId);
            var vassal = Meteor.users.findOne(army.user_id);
            if (lord && vassal) {
              set_lord_and_vassal(lord._id, vassal._id);
            }
          }
        }

        Castles.update(army._id, {$inc:inc});
        Cue.addTask('updateNetCastle', {isAsync:true, unique:true}, {user_id: army.user_id});

        break;
      case 'village':

        if (army.destroyed) {
          alert_villageDestroyed(army.user_id, self.battleData._id, army.name);
          Villages.remove(army._id);
        } else {
          Villages.update(army._id, {$inc:inc});
        }
        Cue.addTask('updateNetVillages', {isAsync:true, unique:true}, {user_id: army.user_id});

        break;
      case 'army':

        if (army.destroyed) {
          alert_armyDestroyed(army.user_id, self.battleData._id, army.name);
          Armies.remove(army._id);
          Moves.remove({army_id:army._id});
        } else {
          Armies.update(army._id, {$inc:inc});
        }
        Cue.addTask('updateNetArmies', {isAsync:true, unique:true}, {user_id: army.user_id});

        break;
    }

    self.trackLosesInPlayer(army);
  })
}




// for rankings
BattleJob.prototype.trackLosesInPlayer = function(army) {
  var self = this;

  var inc = {};

  _.each(army.loses, function(value, key) {
    inc["losses."+key] = value;
  })

  var num = Meteor.users.update(army.user_id, {$inc:inc});
  if (num) {
    Cue.addTask('update_losses_worth',{isAsync:true, unique:true}, {user_id: army.user_id});
  }
}



BattleJob.prototype.gatherData = function() {
  var self = this;

  var castleFields = {name:1, user_id:1, x:1, y:1, username:1, image:1};
  var armyFields = {name:1, user_id:1, x:1, y:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1};
  var villageFields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1};

  _.each(s.army.types, function(type) {
    castleFields[type] = 1;
    armyFields[type] = 1;
    villageFields[type] = 1;
  })

  var armies = Armies.find({x:self.x, y:self.y}, {fields: armyFields});
  var castleData = Castles.findOne({x:self.x, y:self.y}, {fields: castleFields});
  var villageData = Villages.findOne({x:self.x, y:self.y}, {fields: villageFields});

  armies.forEach(function(a) {
    var army =  new BattleArmy();
    army.unitType = 'army';
    processUnit(army, a);
    self.currentRound.armies.push(army);
    self.handleEnteredAlert(army);
  })

  if (castleData) {
    var castle = new BattleArmy();
    castle.unitType = 'castle';
    processUnit(castle, castleData);
    self.currentRound.armies.push(castle);
    self.currentRound.castle = castleData;
    self.handleEnteredAlert(castle);
  }

  if (villageData) {
    var village = new BattleArmy();
    village.unitType = 'village';
    processUnit(village, villageData);
    self.currentRound.armies.push(village);
    self.currentRound.village = villageData;
    self.handleEnteredAlert(village);
  }
}



BattleJob.prototype.handleEnteredAlert = function(army) {
  var self = this;

  // has alert already been sent?
  if (_.indexOf(self.battleData.unitsFromPreviousRounds, army._id) == -1) {
    // send alert
    alert_battleStart(army.user_id, army._id, army.unitType, self.battleData._id);

    // if this is a castle send alert to lords that vassal is under attack
    // allies_above is filled in when battle is run
    // so have to get it here
    if (army.unitType == 'castle') {
      var user = Meteor.users.findOne(army.user_id,  {fields: {allies_above:1}});
      if (user && user.allies_above) {
        alert_vassalIsUnderAttack(user.allies_above, army.user_id, self.battleData._id);
      }
    }

    // add to array so that we know not to send alert next round
    self.battleData.unitsFromPreviousRounds.push(army._id);
  }
}



BattleJob.prototype.saveRound = function() {
  var self = this;

  // flatten allies and enemies or creates call stack size exceeded error
  var keysToPick = ['_id', 'username', 'unitType', 'x', 'y', 'name'];

  var armies = _.map(self.currentRound.armies, function(army) {
    army.allies = _.map(army.allies, function(ally) {
      return _.pick(ally, keysToPick);
    })
    army.enemies = _.map(army.enemies, function(enemy) {
      return _.pick(enemy, keysToPick);
    })
    return army;
  })

  var roundData = _.omit(self.currentRound, 'armies');
  roundData.armies = armies;
  roundData.battle_id = self.battleData._id;
  roundData.roundNumber = self.battleData.roundNumber;
  roundData.createdAt = new Date();
  roundData = _.omit(roundData, _.functions(roundData));

  Rounds.insert(roundData);
}



BattleJob.prototype.saveBattle = function() {
  var self = this;

  _.each(self.currentRound.armies, function(army) {

    // check for preexisting losses
    var data = _.find(self.battleData.loses, function(l) {
      return l._id == army._id;
    })

    if (data) {

      // remove from roundData.losses
      self.battleData.loses = _.reject(self.battleData.loses, function(l) {
        return l._id == army._id;
      })

    } else {

      // if no losses set to 0
      if (!data) {
        data = {
          _id:army._id,
          castle_id:army.castle_id,
          name:army.name,
          user_id:army.user_id,
          username:army.username,
          x:army.x,
          y:army.y,
          total:0,
          power:0,
          unitType:army.unitType
        }

        _.each(s.army.types, function(type) {
          data[type] = 0;
        })
      }
    }

    // add loses from current round
    _.each(s.army.types, function(type) {
      data[type] += army.loses[type];
      data.total += army.loses[type];
      data.power += army.finalPowerPerSoldier[type] * army.loses[type];
    })

    self.battleData.loses.push(data);
  })

  self.battleData.updatedAt = new Date();
  self.battleData.isOver = self.currentRound.battleIsOver;
  self.battleData.isRunning = false;

  Battles2.update(self.battleData._id, self.battleData);
}




var processUnit = function(unit, unitData) {
  _.each(s.army.types, function(type) {
    unit.units[type] = unitData[type];
  })

  unit.user_id = unitData.user_id;
  unit.isRealArmy = true;
  unit.name = unitData.name;
  unit._id = unitData._id;
  unit.username = unitData.username;
  unit.x = unitData.x;
  unit.y = unitData.y;

  if (unitData.castle_id) {
    unit.castle_id = unitData.castle_id;
  }
}
