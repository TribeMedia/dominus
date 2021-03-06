Template.battle.helpers({
    battle: function() {
        return Battles2.findOne(this._id)
    }
})

Template.battle.onCreated(function() {
    this.autorun(function() {
        if (Template.currentData()) {
            if (Template.currentData()._id) {
                Meteor.subscribe('battle', Template.currentData()._id)
            }
        }
    })
})

Template.battle.rendered = function() {
    document.body.style.backgroundColor = '#333';
}

Template.battleLoading.rendered = function() {
    document.body.style.backgroundColor = '#333';
}
