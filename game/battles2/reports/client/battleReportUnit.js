Template.battleReportUnit.helpers({
  icon_name: function() {
    if (this.isAttacker) {
      return 'fa-gavel';
    } else {
      return 'fa-shield';
    }
  },

  unitNum: function() {
    var army = Template.parentData(1);

    if (army && army.units) {
      return army.units[this];
    }
  },

  isCastle: function() {
    var army = Template.currentData();
    if (army && army.unitType) {
      return army.unitType == 'castle';
    }
  },

  isVillage: function() {
    var army = Template.currentData();
    if (army && army.unitType) {
      return army.unitType == 'village';
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
})
