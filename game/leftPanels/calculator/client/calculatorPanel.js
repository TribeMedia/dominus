Template.calculatorPanel.helpers({
  armies: function() {
    Session.get('updateCalculatorTemplates');
    return _.sortBy(calcBattle.armies, function(army) {
      return army.orderOfArrival;
    });
  },

  calcBattle: function() {
    Session.get('updateCalculatorTemplates');
    return calcBattle;
  }
})


Template.calculatorPanel.events({
  'click #addButton': function(event, template) {

    var army = new BattleArmy();
    army.orderOfArrival = calcBattle.armies.length;

    calcBattle.armies.push(army);
    calcBattle.run();
    Session.set('updateCalculatorTemplates', Math.random());
  },

  'click #addSelectedButton': function(event, template) {
    var type = Session.get('selected_type');
    var alert = template.find('#calcBattleAlert');

    $(alert).hide();

    var data = null;
    if (type) {

      if (type != 'castle' && type != 'village' && type != 'army') {
        $(alert).html('Select a castle, village or army.');
        $(alert).show();
        return false;
      }

      // make sure there are not more than one castle or village
      if (type == 'castle' || type == 'village') {
        if (calcBattle.isThereACastleOrVillageInBattle()) {
          $(alert).html('Can only be one castle or village in a battle.');
          $(alert).show();
          return false;
        }
      }

      var army = new BattleArmy();
      army.orderOfArrival = calcBattle.armies.length;

      if (type == 'castle') {

        data = RightPanelCastle.findOne(Session.get('selected_id'));
        army.unitType = 'castle';

      } else if (type == 'village') {

        data = RightPanelVillages.findOne(Session.get('selected_id'));
        army.unitType = 'village';

      } else if (type == 'army') {

        data = RightPanelArmies.findOne(Session.get('selected_id'));
        army.unitType = 'army';

      }

      // make sure unit isn't already in battle
      var dupe = false;
      _.each(calcBattle.armies, function(a) {
        if (a._id == data._id) {
          dupe = true;
        }
      })

      if (dupe) {
        $(alert).html('This unit is already in the battle.');
        $(alert).show();
        return false;
      }

      army.user_id = data.user_id;
      army.allies_below = [];
      army.allies_above = [];
      army.team = [];
      army.king = null;
      army.lord = null;
      army.vassals = [];
      army.isDominus = false;
      army._id = data._id;
      army.name = data.name;
      army.isRealArmy = true;

      _.each(s.army.types, function(type) {
        army.units[type] = data[type];
      })

      if (army.unitType == 'castle') {
        calcBattle.castle = army;
      }

      if (army.unitType == 'village') {
        calcBattle.village = army;
      }

      calcBattle.armies.push(army);
      calcBattle.run();
      Session.set('updateCalculatorTemplates', Math.random());

    } else {
      $(alert).html('Select a castle, village or army then click add selected button.');
      $(alert).show();
    }
  }
})


Template.calculatorPanel.onCreated(function() {
  var self = this;
  Session.set('updateCalculatorTemplates', Math.random());
  calcBattle = new BattleRound();
})



Template.calculatorPanel.onRendered(function() {
  this.firstNode.parentNode._uihooks = leftPanelAnimation;
})
