Template.calculatorArmy.helpers({
  unitNum: function() {
    var army = Template.parentData(1);

    if (army && army.units) {
      return army.units[this];
    }
  },

  isTypeSelected: function(type) {
    if (type == this.unitType) {
      return 'active';
    }
  },

  isArmy: function() {
    var army = Template.currentData();
    if (army && army.unitType) {
      return army.unitType == 'army';
    }
  },

  loses: function() {
    var army = Template.parentData(1);

    if (army && army.loses) {
      return army.loses[this];
    }
  },

  basePower: function() {
    var army = Template.parentData(1);

    if (army && army.loses) {
      return army.basePower[this];
    }
  },

  unitBonus: function() {
    var army = Template.parentData(1);

    if (army && army.loses) {
      return army.unitBonus[this];
    }
  },

  army: function() {
    var army = Template.currentData();
    if (army) {
      return army;
    }
  },

  won: function() {
    var army = Template.currentData();
    if (army) {
      return army.dif > 0;
    }
  },

  powerLost: function() {
    var army = Template.currentData();
    if (army && army.loses) {
      var power = 0;

      _.each(s.army.types, function(type) {
        power += army.loses[type] * army.finalPowerPerSoldier[type];
      })

      return power;
    }
  },

  soldiersLost: function() {
    var army = Template.currentData();
    if (army && army.loses) {
      var loses = 0;

      _.each(s.army.types, function(type) {
        loses += army.loses[type];
      })

      return loses;
    }
  },

  numSoldiers: function() {
    var army = Template.currentData();
    if (army) {
      var num = 0;

      _.each(s.army.types, function(type) {
        num += army.units[type];
      })

      return num;
    }
  },

  hasEnemies: function() {
    var army = Template.currentData();
    if (army) {
      return army.enemies.length > 0;
    }
  },

  hasAllies: function() {
    var army = Template.currentData();
    if (army) {
      return army.allies.length > 0;
    }
  },

  hasSoldiers: function() {
    var army = Template.currentData();
    if (army) {
      return army.finalPower > 0;
    }
  }
})


Template.calculatorArmy.events({
  'input .armyUnitInput': function(event, template) {
    var type = event.currentTarget.getAttribute('data-type');
    var army = Template.currentData();
    var num = parseInt(event.currentTarget.value);

    if (isNaN(num)) {
      return;
    }

    if (num < 0) {
      return;
    }

    army.units[type] = num;

    updateArmy(army);
  },


  'change .onAllyCastleCheckbox': function(event, template) {
    var value = $(event.currentTarget).is(':checked');
    var army = Template.currentData();
    army.isOnAllyCastle = value;
    updateArmy(army);
  },

  'change .onAllyVillageCheckbox': function(event, template) {
    var value = $(event.currentTarget).is(':checked');
    var army = Template.currentData();
    army.isOnAllyVillage = value;
    updateArmy(army);
  },


  'change .isAttackerCheckbox': function(event, template) {
    var army = Template.currentData();
    if (army.isAttacker) {
      army.isAttacker = false;
    } else {
      army.isAttacker = true;
    }

    updateArmy(army);
  },

  'click .unitTypeButton': function(event, template) {
    var type = event.currentTarget.getAttribute('data-type');
    var army = Template.currentData();
    army.unitType = type;

    updateArmy(army);
  },

  'click .removeArmyButton': function(event, template) {
    var army = Template.currentData();
    removeArmy(army);
  },

  'click .armyUpButton': function(event, template) {
    var army = Template.currentData();
    moveArmyUp(army);
  },

  'click .armyDownButton': function(event, template) {
    var army = Template.currentData();
    moveArmyDown(army);
  }
})


// subtract 1.5, when battle is run orderOfArrival is cleaned up
var moveArmyUp = function(army) {
  army.orderOfArrival -= 1.5;
  updateArmy(army);
}

var moveArmyDown = function(army) {
  army.orderOfArrival += 1.5;
  updateArmy(army);
}


var removeArmy = function(army) {
  var armies = _.reject(calcBattle.armies, function(a) {
    return a.id == army.id;
  })
  calcBattle.armies = armies;
  calcBattle.run();
  Session.set('runCalculator', Math.random());
}

var updateArmy = function(army) {
  var armies = _.reject(calcBattle.armies, function(a) {
    return a.id == army.id;
  })
  armies.push(army);
  calcBattle.armies = armies;
  calcBattle.run();
  Session.set('runCalculator', Math.random());
}
