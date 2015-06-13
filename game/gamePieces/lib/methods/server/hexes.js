Meteor.methods({
    generate_hexes: function(num_of_rings) {
        if (get_user_property("admin")) {
            generate_hexes(num_of_rings)
        }
    },

    // includes specialization bonus
    // includes large hex bonus
    // does not include village level bonus
    getWorthOfHex: function(x, y) {
      var fields = {specialization:1, specializationChanging:1};
      var user = Meteor.users.findOne(Meteor.userId, {fields:fields});
      if (user) {

        var r = resourcesFromSurroundingHexes(x, y, s.resource.num_rings_village);

        // specialization bonus
        var specializationBonus = {}
        _.each(s.resource.types, function(type) {
          specializationBonus[type] = 1;
          if (!user.specializationChanging && user.specialization == type) {
            specializationBonus[type] = s.specialization.bonus;
          }
        })

        _.each(s.resource.types, function(type) {
          r[type] = r[type] * specializationBonus[type];
        });

        var worth = resources_to_gold(r.grain, r.lumber, r.ore, r.wool, r.clay, r.glass);
        return worth;
      } else {
        console.error('no user found in getWorthOfHex');
      }
    },

    doesHexExist: function(x,y) {
        return Hexes.find({x:x, y:y}).count() == 1
    },
})
