// create armies
// add armies to BattleRound
// set all army info
// call BattleRound.run()
// update army info
// call BattleRound.run()


BattleRound = function() {
  // array of BattleArmies
  this.armies = [];

  // if there is a castle here fill this in with it's info
  // {name:1, user_id:1, x:1, y:1, username:1, image:1}
  this.castle = null;

  // if there is a village here fill this in with it's info
  // {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1}
  this.village = null;

  // ----------------------
  // private

  // power of all armies combined
  this.finalPowerAllArmies = 0;
}



// BattleRound.prototype.addArmy = function(army) {
//   this.armies.push(army);
// }


BattleRound.prototype.run = function() {
  var self = this;

  var start = new Date().getTime();

  // find info on all armies
  _.each(self.armies, function(army) {
    self.cacheAllies(army);
    self.cacheEnemies(army);
    army.updateInfo();
    army.updateLocationBonus();
    self.updateUnitBonus(army);
    army.updateFinalPower();
  })

  // do battle
  _.each(self.armies, function(army) {
    army.dif = self.getTeamFinalPower(army) - self.getEnemyFinalPower(army);
    self.findPowerToLose(army);
    army.findLoses();
  })

  console.log('ran battle in ' + (new Date().getTime() - start) + 'ms');
}



// -----------------------
// private


BattleRound.prototype.updateUnitBonus = function(army) {
  var enemyPercentage = this.getEnemyUnitPercentage(army);

  var bonus = {};
  bonus.footmen = army.basePower.total * army.percentage.footmen * enemyPercentage.pikemen;
  bonus.archers = army.basePower.total * army.percentage.archers * enemyPercentage.footmen;
  bonus.pikemen = army.basePower.total * army.percentage.pikemen * enemyPercentage.cavalry;
  bonus.cavalry = army.basePower.total * army.percentage.cavalry * (enemyPercentage.footmen + enemyPercentage.archers);

  // catapults
  // if there is an enemy castle of village in this hex then catapults get bonus
  // catapults must be attacker to get bonus
  // catapults get bonus even if building is not in fight
  // this is to stop building from sending out units and cats losing their bonus
  bonus.catapults = 0;

  if (army.units.catapults) {

    var isEnemyCastleOrVillageHere = false;

    if (army.isAttacker) {
      if (this.castle && this.castle.user_id != army.user_id) {
        if (army.isEnemy(castle)) {
          isEnemyCastleOrVillageHere = true;
        }
      }

      if (this.village && this.village.user_id != army.user_id) {
        if (army.isEnemy(village)) {
          isEnemyCastleOrVillageHere = true;
        }
      }

      if (isEnemyCastleOrVillageHere) {
        bonus.catapults = army.basePower.catapults * s.army.stats.catapults.bonus_against_buildings;
      }
    }

  }

  bonus.total = 0;
  _.each(s.army.types, function(type) {
    check(bonus[type], validNumber);
    bonus.total += bonus[type];
  })

  army.unitBonus = bonus;
}




BattleRound.prototype.getEnemyUnitPercentage = function(army) {
  var percentage = {};

  _.each(s.army.types, function(type) {
    percentage[type] = 0;
  })

  var num = this.getEnemyNumUnits(army);

  _.each(s.army.types, function(type) {

    if (num[type] == 0 || num.total == 0) {
      percentage[type] = 0;
    } else {
      percentage[type] = num[type] / num.total;
      check(percentage[type], validNumber);
    }

  })

  return percentage;
}


BattleRound.prototype.getEnemyNumUnits = function(army) {
  var num = {};
  num.total = 0;
  _.each (s.army.types, function(type) {
    num[type] = 0;
  })

  var enemies = army.enemies;

  _.each(enemies, function(enemy) {
    _.each(s.army.types, function(type) {
      num[type] += enemy.units[type];
      num.total += enemy.units[type];
      check(num[type], validNumber);
    })
  })

  return num;
}



// cache these
BattleRound.prototype.cacheAllies = function(army) {
  army.allies = this.getAllies(army);
}

BattleRound.prototype.cacheEnemies = function(army) {
  army.enemies = this.getEnemies(army);
}



BattleRound.prototype.getTeamFinalPower = function(army) {
  var teamFinalPower = 0;

  // call cacheAllies before this
  var allies = army.allies;

  _.each(allies, function(ally) {
    teamFinalPower += ally.finalPower;
  })

  teamFinalPower += army.finalPower;

  check(teamFinalPower, validNumber);
  return teamFinalPower;
}


BattleRound.prototype.getEnemyFinalPower = function(army) {
  var enemyFinalPower = 0;

  // call cache enemies before this
  var enemies = army.enemies;

  _.each(enemies, function(enemy) {
    enemyFinalPower += enemy.finalPower;
  })

  check(enemyFinalPower, validNumber);
  return enemyFinalPower;
}


// find enemies of unit's enemies who are unit's allies
// just getting people who are allies is not enough
BattleRound.prototype.getAllies = function(army) {
  var self = this;

  var enemies = this.getEnemies(army);
  var enemyOfEnemies = [];

  _.each(enemies, function(enemy) {
    _.each(self.getEnemies(enemy), function(enemyOfEnemy) {
      if (_.indexOf(enemyOfEnemies, enemyOfEnemy) == -1) {
        if (enemyOfEnemy._id != army._id) {
          enemyOfEnemies.push(enemyOfEnemy)
        }
      }
    })
  })

  return _.filter(enemyOfEnemies, function(u) {
    return army.isAlly(u)
  })
}


BattleRound.prototype.getEnemies = function(army) {
  return _.filter(this.armies, function(otherArmy) {
    return army.isEnemy(otherArmy);
  })
}



BattleRound.prototype.updateFinalPowerAllArmies = function() {
  var self = this;

  var power = 0;

  _.each(self.armies, function(army) {
    power += army.finalPower;
  })

  check(power, validNumber);
  self.finalPowerAllArmies = power;
}



BattleRound.prototype.getNumUniqueEnemyArmies = function(army) {
  var numUnique = 0;
  var userIds = [];

  _.each(army.enemies, function(enemy) {
    if (_.indexOf(userIds, enemy.user_id) == -1) {
      numUnique++;
      userIds.push(enemy.user_id);
    }
  })

  check(numUnique, validNumber);
  return numUnique;
}


// includes army
BattleRound.prototype.getNumUniqueAlliedArmies = function(army) {
  var numUnique = 1;
  var userIds = [army.user_id];

  _.each(army.allies, function(ally) {
    if (_.indexOf(userIds, ally.user_id) == -1) {
      numUnique++;
      userIds.push(ally.user_id);
    }
  })

  check(numUnique, validNumber);
  return numUnique;
}




BattleRound.prototype.findPowerToLose = function(army) {
  var self = this;

  self.updateFinalPowerAllArmies();
  var numEnemyArmies = self.getNumUniqueEnemyArmies(army);
  var numAllyArmies = self.getNumUniqueAlliedArmies(army);
  var adjustForNumPeopleInBattle = Math.max(1, numEnemyArmies / numAllyArmies)

  var powerToLose = 0;

  if (army.dif > 0) {
    // win

    powerToLose = s.battle_power_lost_per_round + (self.finalPowerAllArmies/1000)
    powerToLose = powerToLose * adjustForNumPeopleInBattle;
    powerToLose = Math.min(powerToLose, self.getEnemyFinalPower(army));
    powerToLose = powerToLose * s.battle_power_lost_winner_ratio;

  } else {
    // tie or lose

    powerToLose = s.battle_power_lost_per_round + (self.finalPowerAllArmies/1000)
    powerToLose = powerToLose * adjustForNumPeopleInBattle

  }

  check(powerToLose, validNumber);
  army.powerToLose = powerToLose;
}
