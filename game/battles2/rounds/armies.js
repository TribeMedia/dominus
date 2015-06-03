BattleArmy = function() {
  var self = this;

  // set these
  this.units = {};
  this.isAttacker = true;

  // 'army', 'village', 'castle'
  this.unitType = 'army';

  // only for army types
  this.isOnAllyCastle = false;
  this.isOneAllyVillage = false;

  this.user_id = Math.floor(Math.random() * 100000);
  this.allies_below = [];
  this.allies_above = [];
  this.team = [];
  this.king = null;
  this.lord = null;
  this.vassals = [];
  this.isDominus = false;

  this.id = Math.floor(Math.random() * 100000);
  this.createdAt = new Date();

  // -----------------------------
  // private

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

  _.each(s.army.types, function(type) {
      self.units[type] = 0;
      self.basePower[type] = 0;
      self.unitBonus[type] = 0;
      self.loses[type] = 0;
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
}


// -------------------
// private


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
    var enemyTypes = ['enemy', 'enemy_ally'];
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

  if (self.unitType == 'castle') {
    self.locationBonus = self.basePower.total * s.castle.defense_bonus;
    self.castleDefenseBonus = true;
  }

  if (self.unitType == 'village') {
    self.locationBonus = self.basePower.total * s.village.defense_bonus;
    self.villageDefenseBonus = true
  }

  if (self.unitType == 'army') {
    if (self.isOnAllyCastle) {
      self.locationBonus = self.basePower.total * s.castle.ally_defense_bonus;
      self.onAllyCastleBonus = true;
    }

    if (self.isOnAllyVillage) {
      self.locationBonus = self.basePower.total * s.village.ally_defense_bonus;
      self.onAllyVillageBonus = true;
    }
  }

  check(self.locationBonus, validNumber);
}



BattleArmy.prototype.updateFinalPower = function() {
  this.finalPower = this.basePower.total + this.unitBonus.total + this.locationBonus;
  check(this.finalPower, validNumber);
}



BattleArmy.prototype.getFinalPowerOfEachSoldierType = function() {
  var self = this;

  var power = {};
  _.each(s.army.types, function(type) {
    power[type] = self.basePower[type] + self.unitBonus[type]

    // location bonus
    if (self.castleDefenseBonus) {
      soldierPower[type] = soldierPower[type] * s.castle.defense_bonus
    }
    if (self.villageDefenseBonus) {
      soldierPower[type] = soldierPower[type] * s.village.defense_bonus
    }
    if (self.onAllyCastleBonus) {
      soldierPower[type] = soldierPower[type] * s.castle.ally_defense_bonus
    }
    if (self.onAllyVillageBonus) {
      soldierPower[type] = soldierPower[type] * s.village.ally_defense_bonus
    }

    // divide by number of soldiers
    if (self.units[type] == 0) {
      power[type] = 0;
    } else {
      power[type] = power[type] / self.units[type];
    }

    check(power[type], validNumber);
  })

  return power;
}



// after powerToLose is set call this to find loses
BattleArmy.prototype.findLoses = function() {
  var self = this

  var loses = {};
  _.each(s.army.types, function(type) {
    loses[type] = 0;
  })

  if (this.numUnits == 0) {
    return;
  }

  var finalPowerOfEachSoldierType = this.getFinalPowerOfEachSoldierType();

  // find which soldier is worth the least
  var smallestSoldierPower = 9999999;
  _.each(s.army.types, function(type) {
    if (finalPowerOfEachSoldierType[type] > 0 && finalPowerOfEachSoldierType[type] < smallestSoldierPower) {
      smallestSoldierPower = finalPowerOfEachSoldierType[type];
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
        if (finalPowerOfEachSoldierType[type] <= powerLeft) {

          loses[type]++;
          numUnits--;
          powerLeft -= finalPowerOfEachSoldierType[type];

        } else {
          fails++;
        }
      }

    })
  }

  this.loses = loses;
}
