Template.calculatorArmy.helpers({
  unitNum: function() {
    var army = Template.parentData(1);

    if (army && army.units) {
      return army.units[this];
    }
  },

  isTypeSelected: function(type) {
    if (type == this.unitType) {
      return 'selected';
    }
  },
})


Template.calculatorArmy.events({
  'input .armyUnitInput': function(event, template) {
    var type = event.currentTarget.getAttribute('data-type');
    var army = Template.currentData();
    
    army.units[type] = parseInt(event.currentTarget.value);

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
  }
})



var updateArmy = function(army) {
  var armies = _.reject(calcBattle.armies, function(a) {
    return a.id == army.id;
  })
  armies.push(army);
  calcBattle.armies = armies;
  calcBattle.run();
  Session.set('runCalculator', Math.random());
}
