Template.calculatorPanel.helpers({
  armies: function() {
    Session.get('runCalculator');
    return _.sortBy(calcBattle.armies, function(army) {
      return army.createdAt;
    });
  }
})


Template.calculatorPanel.events({
  'click #addButton': function(event, template) {

    var army = new BattleArmy();

    calcBattle.armies.push(army);
    Session.set('runCalculator', Math.random());
  },

  'click #addSelectedButton': function(event, template) {

  }
})


Template.calculatorPanel.onCreated(function() {
  var self = this;
  Session.set('runCalculator', Math.random());
  calcBattle = new BattleRound();
})
