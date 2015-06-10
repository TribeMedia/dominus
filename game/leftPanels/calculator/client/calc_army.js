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
  },

  isOnAllyCastle: function() {
    var army = Template.currentData();
    if (army) {
      return army.isOnAllyCastle ? 'checked' : '';
    }
  },

  isOnAllyVillage: function() {
    var army = Template.currentData();
    if (army) {
      return army.isOnAllyVillage ? 'checked' : '';
    }
  },
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
    army.isOnAllyVillage = false;
    army.isOnAllyCastle = value;
    updateArmy(army);
  },

  'change .onAllyVillageCheckbox': function(event, template) {
    var value = $(event.currentTarget).is(':checked');
    var army = Template.currentData();
    army.isOnAllyCastle = false;
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
    var alert = template.find('.calcArmyAlert');
    var army = Template.currentData();

    $(alert).hide();
    calcBattle.castle = null;
    calcBattle.village = null;

    // make sure there isn't more than one castle or village
    var foundCastleOrVillage = false;
    if (type == 'castle' || type == 'village') {
      _.each(calcBattle.armies, function(a) {
        if (a.id != army.id) {
          if (a.unitType == 'castle' || a.unitType == 'village') {
            foundCastleOrVillage = true;
          }
        }
      })
    }

    if (foundCastleOrVillage) {
      $(alert).html('Can only be one castle or village in a battle.');
      $(alert).show();
    } else {
      army.unitType = type;

      // fill in castle or village
      if (type == 'castle') {
        var data = {name:'asdf', user_id:army.user_id, x:1, y:1, username:'asdf'};
        calcBattle.castle = data;
      } else if (type == 'village') {
        var data = {name:'asdf', user_id:army.user_id, x:1, y:1, username:'asdf', castle_x:1, castle_y:1, castle_id:12345};
        calcBattle.village = data;
      }

      updateArmy(army);
    }
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
  Session.set('runCalcBattle', Math.random());
}

var updateArmy = function(army) {
  var armies = _.reject(calcBattle.armies, function(a) {
    return a.id == army.id;
  })
  armies.push(army);
  calcBattle.armies = armies;
  Session.set('runCalcBattle', Math.random());
}



Template.calculatorArmy.onRendered(function() {
  this.firstNode.parentNode._uihooks = battleCalculatorAnimation;
})


Template.calculatorArmy.onCreated(function() {

  // subscribe to user if this is a real army
  var army = Template.currentData();
  if (army && army.isRealArmy) {
    this.subscribe('calcUser', army.user_id);
  }

  // if this is a real army wait for subscription
  this.autorun(function() {
    Session.get('runCalcBattle');
    if (army.isRealArmy) {
      if (Template.instance().subscriptionsReady()) {
        calcBattle.run();
        Session.set('updateCalculatorTemplates', Math.random());
      }
    } else {
      calcBattle.run();
      Session.set('updateCalculatorTemplates', Math.random());
    }
  })
})
