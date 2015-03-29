Template.landingStartSoon.helpers({
    gameStartDate: function() {
        var s = Settings.findOne({name:'gameStartDate'});
        if (s) {
            return s.value;
        }
    },

    dominusBase: function() {
        var s = Settings.findOne({name:'dominusBase'});
        if (s) {
            return s.value;
        }
    }
});
