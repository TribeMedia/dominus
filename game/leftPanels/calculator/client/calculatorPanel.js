Template.calculatorPanel.helpers({
  armies: function() {
    Session.get('runCalculator');
    return _.sortBy(calcBattle.armies, function(army) {
      return army.orderOfArrival;
    });
  },

  calcBattle: function() {
    Session.get('runCalculator');
    return calcBattle;
  }
})


Template.calculatorPanel.events({
  'click #addButton': function(event, template) {

    var army = new BattleArmy();
    army.orderOfArrival = calcBattle.armies.length;

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



Template.calculatorPanel.onRendered(function() {
  this.firstNode.parentNode._uihooks = leftPanelAnimation;
})
