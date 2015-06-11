BattleArmy = function() {
  var self = this;

  // set these
  this.units = {};
  this.isAttacker = true;

  // 'army', 'village', 'castle'
  this.unitType = 'army';

  // only for army types
  this.isOnAllyCastle = false;
  this.isOnAllyVillage = false;

  this.user_id = Math.floor(Math.random() * 100000);
  this.allies_below = [];
  this.allies_above = [];
  this.team = [];
  this.king = null;
  this.lord = null;
  this.vassals = [];
  this.isDominus = false;

  // if set to true it will look in db for user to update allies_below etc.
  this.isRealArmy = false;

  // assign random id
  // set to _id of army or leave random value
  this._id = Math.floor(Math.random() * 1000000);
  this.name = names.armies.part1[_.random(names.armies.part1.length-1)] +' '+ names.armies.part2[_.random(names.armies.part2.length-1)];

  // order that armies arrived at hex, ascending, 0 is first, 0 if castle or village
  this.orderOfArrival = 0;

  this.createdAt = new Date();

  // -----------------------------
  // private

  // filled in when battle runs
  this.enemyFinalPower = 0;
  this.teamFinalPower = 0;
  this.allyFinalPower = 0;

  this.percentage = {};
  _.each(s.army.types, function(type) {
    self.units[type] = 0;
    self.percentage[type] = 0;
  })

  this.numUnits = 0;

  this.basePower = {};
  this.unitBonus = {};
  this.basePower.total = 0;
  this.unitBonus.total = 0;
  this.loses = {};
  this.finalPowerPerSoldier = {};

  _.each(s.army.types, function(type) {
      self.units[type] = 0;
      self.basePower[type] = 0;
      self.unitBonus[type] = 0;
      self.loses[type] = 0;
      self.finalPowerPerSoldier[type] = 0;
  })

  this.locationBonus = 0;
  this.finalPower = 0;

  // cache these
  // run BattleRounds.cacheAllies and cacheEnemies to update
  this.allies = [];
  this.enemies = [];

  // has army won or lost
  this.dif = 0;
  this.powerToLose = 0;

  // did army get a location bonus
  self.castleDefenseBonus = false;
  self.villageDefenseBonus = false;
  self.onAllyCastleBonus = false;
  self.onAllyVillageBonus = false;

  // does unit have no soldiers after battle is over
  this.destroyed = false;
}


// -------------------
// private


BattleArmy.prototype.updateUser = function() {
  if (this.isRealArmy) {
    var fields = {allies_below:1, allies_above:1, team:1, king:1, lord:1, vassals:1, isDominus:1};

    if (Meteor.isServer) {
      var user = Meteor.users.findOne(this.user_id, {fields:fields});
    } else {
      var user = Calcusers.findOne(this.user_id, {fields:fields});
    }

    if (user) {
      this.allies_below = user.allies_below;
      this.allies_above = user.allies_above;
      this.team = user.team;
      this.king = user.king;
      this.lord = user.lord;
      this.vassals = user.vassals;
      this.isDominus = user.isDominus;
    } else {
      console.error('could not find user');
    }
  }
}


BattleArmy.prototype.isEnemy = function(otherArmy) {

  // if army is dominus then they can attack any other army
  if (this.isDominus && this.unitType == 'army' && otherArmy.unitType == 'army') {
    return true;
  }

  var user = {_id:this.user_id, team:this.team, lord:this.lord, allies_above:this.allies_above, allies_below:this.allies_below, king:this.king, vassals:this.vassals};
  var otherUserId = otherArmy.user_id;
  var relation = getRelationType(user, otherUserId);

  if (this.unitType == 'castle') {
    var enemyTypes = ['vassal', 'direct_vassal', 'enemy', 'enemy_ally'];
  }

  if (this.unitType == 'village') {
    var enemyTypes = ['enemy', 'enemy_ally'];
  }

  if (this.unitType == 'army') {
    if (otherArmy.unitType == 'castle') {
      var enemyTypes = ['enemy', 'enemy_ally', 'lord', 'direct_lord', 'king'];
    } else {
      var enemyTypes = ['enemy', 'enemy_ally'];
    }
  }

  if (_.indexOf(enemyTypes, relation) != -1) {
    return true;
  }

  return false;
}


BattleArmy.prototype.isAlly = function(otherArmy) {

  var user = {_id:this.user_id, team:this.team, lord:this.lord, allies_above:this.allies_above, allies_below:this.allies_below, king:this.king, vassals:this.vassals};
  var otherUserId = otherArmy.user_id;
  var relation = getRelationType(user, otherUserId);

  if (this.unitType == 'castle') {
    var allyTypes = ['mine', 'king', 'direct_lord', 'lord'];
  }

  if (this.unitType == 'village') {
    var allyTypes = ['mine', 'king', 'direct_lord', 'lord', 'vassal', 'direct_vassal'];
  }

  if (this.unitType == 'army') {
    if (otherArmy.unitType == 'castle') {
      var allyTypes = ['mine', 'vassal', 'direct_vassal'];
    } else {
      var allyTypes = ['mine', 'king', 'direct_lord', 'lord', 'vassal', 'direct_vassal'];
    }
  }

  if (_.indexOf(allyTypes, relation) != -1) {
    return true;
  }

  return false;
}


BattleArmy.prototype.updateInfo = function() {
  var self = this;

  // num units
  self.numUnits = 0;
  _.each(s.army.types, function(type) {
    self.numUnits += self.units[type];
  });
  check(self.numUnits, validNumber);

  // base power
  self.basePower.total = 0;
  _.each(s.army.types, function(type) {
    if (self.isAttacker) {
      self.basePower[type] = s.army.stats[type].offense * self.units[type];
      self.basePower.total += s.army.stats[type].offense * self.units[type];
    } else {
      self.basePower[type] = s.army.stats[type].defense * self.units[type];
      self.basePower.total += s.army.stats[type].defense * self.units[type];
    }
  });

  // percentage
  _.each(s.army.types, function(type) {
    if (self.units[type] == 0) {
      self.percentage[type] = 0
    } else {
      self.percentage[type] = self.units[type] / self.numUnits
    }
  });
}


BattleArmy.prototype.updateLocationBonus = function() {
  var self = this;

  self.castleDefenseBonus = false;
  self.villageDefenseBonus = false;
  self.onAllyCastleBonus = false;
  self.onAllyVillageBonus = false;
  self.locationBonus = 0;

  if (self.unitType == 'castle') {
    self.locationBonus = self.basePower.total * (s.castle.defense_bonus - 1);
    self.castleDefenseBonus = true;
  }

  if (self.unitType == 'village') {
    self.locationBonus = self.basePower.total * (s.village.defense_bonus - 1);
    self.villageDefenseBonus = true
  }

  if (self.unitType == 'army') {
    if (self.isOnAllyCastle) {
      self.locationBonus = self.basePower.total * (s.castle.ally_defense_bonus - 1);
      self.onAllyCastleBonus = true;
    }

    if (self.isOnAllyVillage) {
      self.locationBonus = self.basePower.total * (s.village.ally_defense_bonus - 1);
      self.onAllyVillageBonus = true;
    }
  }

  check(self.locationBonus, validNumber);
}



BattleArmy.prototype.updateFinalPower = function() {
  this.finalPower = this.basePower.total + this.unitBonus.total + this.locationBonus;
  check(this.finalPower, validNumber);
}



BattleArmy.prototype.updateFinalPowerOfEachSoldierType = function() {
  var self = this;

  _.each(s.army.types, function(type) {
    self.finalPowerPerSoldier[type] = self.basePower[type] + self.unitBonus[type]

    // location bonus
    if (self.castleDefenseBonus) {
      self.finalPowerPerSoldier[type] = self.finalPowerPerSoldier[type] * s.castle.defense_bonus
    }
    if (self.villageDefenseBonus) {
      self.finalPowerPerSoldier[type] = self.finalPowerPerSoldier[type] * s.village.defense_bonus
    }
    if (self.onAllyCastleBonus) {
      self.finalPowerPerSoldier[type] = self.finalPowerPerSoldier[type] * s.castle.ally_defense_bonus
    }
    if (self.onAllyVillageBonus) {
      self.finalPowerPerSoldier[type] = self.finalPowerPerSoldier[type] * s.village.ally_defense_bonus
    }

    // divide by number of soldiers
    if (self.units[type] == 0) {
      self.finalPowerPerSoldier[type] = 0;
    } else {
      self.finalPowerPerSoldier[type] = self.finalPowerPerSoldier[type] / self.units[type];
    }

    check(self.finalPowerPerSoldier[type], validNumber);
  })
}



// after powerToLose is set call this to find loses
BattleArmy.prototype.findLoses = function() {
  var self = this

  var loses = {};
  _.each(s.army.types, function(type) {
    loses[type] = 0;
  })

  if (this.numUnits == 0) {
    this.loses = loses;
    this.destroyed = true;
    return;
  }

  // find which soldier is worth the least
  var smallestSoldierPower = 9999999;
  _.each(s.army.types, function(type) {
    if (self.finalPowerPerSoldier[type] > 0 && self.finalPowerPerSoldier[type] < smallestSoldierPower) {
      smallestSoldierPower = self.finalPowerPerSoldier[type];
    }
  })

  // take away until powerToLose is < smallestSoldierPower
  var fails = 0;
  var maxFails = s.army.types.length;
  var powerLeft = this.powerToLose;
  var numUnits = this.numUnits;
  while (powerLeft > 0 && numUnits > 0 && fails < maxFails) {
    _.each(s.army.types, function(type) {

      // if there is a unit of this type in army
      if (self.units[type] - loses[type] > 0) {

        // if there is enough power left to take this unit away
        if (self.finalPowerPerSoldier[type] <= powerLeft) {

          loses[type]++;
          numUnits--;
          powerLeft -= self.finalPowerPerSoldier[type];

        } else {
          fails++;
        }
      }

    })
  }

  if (numUnits == 0) {
    this.destroyed = true;
  }

  this.loses = loses;
}
