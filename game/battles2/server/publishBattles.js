Meteor.publish('battle', function(id) {
  if (id) {
    return Battles2.find(id)
  }
  this.ready()
})


Meteor.publish('battle_notifications_at_hex', function(x,y) {
  if (this.userId) {
    if (typeof x != 'undefined' && typeof y != 'undefined')
      return Battles2.find({x:x, y:y, isOver:false})
    } else {
      this.ready();
    }
  })

  Meteor.publish('fight', function(id) {
    if (id) {
      return Rounds.find(id)
    }
    this.ready()
  })

  Meteor.publish('lastFightInBattle', function(battle_id) {
    if (battle_id) {
      return Rounds.find({battle_id:battle_id}, {sort:{roundNumber:-1}, limit:1})
    }
    this.ready()
  })

  Meteor.publish('roundtitles', function(battle_id) {
    var sub = this;
    var cur = Rounds.find({battle_id:battle_id}, {fields: { roundNumber:1, battle_id:1, createdAt:1 }});
    Mongo.Collection._publishCursor(cur, sub, 'roundtitles');
    return sub.ready();
  })


  Battles2.allow({insert: false, update: false, remove: false})
  Rounds.allow({insert: false, update: false, remove: false})
