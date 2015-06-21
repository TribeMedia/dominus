Template.battleReport.helpers({
  next_fight_in: function() {
    Session.get('refresh_time_field')
    var time = moment(new Date(this.updatedAt)).add(s.battle_interval, 'ms')
    if (time.isAfter(moment(new Date()))) {
      return moment(new Date(this.updatedAt)).add(s.battle_interval, 'ms').fromNow()
    } else {
      return null
    }
  },

  numLost: function() {
    var parentData = Template.parentData(1);
    if (parentData) {
      return parentData[this];
    }
  },

  roundTitles: function() {
    return Roundtitles.find({battle_id:this._id}, {sort:{roundNumber:-1}})
  },

  losesOpen: function() {
    return Template.instance().losesOpen.get();
  }
})


Template.battleReport.events({
  'click .losesOpenButton': function(event, template) {
    var open = Template.instance().losesOpen.get();
    if (open) {
      Template.instance().losesOpen.set(false);
    } else {
      Template.instance().losesOpen.set(true);
    }
  }
})


Template.battleReport.onCreated(function() {
  var self = this;

  self.losesOpen = new ReactiveVar(false);

  self.autorun(function() {
    var currentData = Template.currentData();
    if (currentData) {
      self.subscribe('roundtitles', currentData._id);
    }
  })

  //this.subscribe('lastFightInBattle', Template.currentData()._id);
})
