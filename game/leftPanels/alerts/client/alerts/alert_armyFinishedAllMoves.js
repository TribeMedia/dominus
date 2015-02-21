var helpers = {
    title: function() {
        return 'Your army finished moving.'
    },

    army: function() {
        if (this) {
            return AlertArmies.findOne(this.vars.army_id)
        }
    }
}

Template.alert_armyFinishedAllMoves.helpers(_.extend(alertSharedHelpers, helpers))
Template.alert_armyFinishedAllMoves.events = alertSharedEvents
Template.alert_armyFinishedAllMoves.rendered = alertSharedRendered

Template.alert_armyFinishedAllMoves.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            if (self.isOpen.get()) {
                Meteor.subscribe('alertArmy', Template.currentData().vars.army_id)
            }
        }
    })
}
