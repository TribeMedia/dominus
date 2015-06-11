Meteor.publish('calcUser', function(user_id) {
  var fields = {allies_below:1, allies_above:1, team:1, king:1, lord:1, vassals:1, isDominus:1, username:1};
  var sub = this
  var cur = Meteor.users.find(user_id, {fields:fields});
  Mongo.Collection._publishCursor(cur, sub, 'calcusers')
  return sub.ready()
});
