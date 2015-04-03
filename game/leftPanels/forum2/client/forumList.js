Template.forumList.helpers({
    tags: function() {
        return Forumtags.find();
    },

    topics: function() {
        return Forumtopics.find();
    },

    tagName: function() {
        var tag = Forumtags.findOne(this.tagId);
        if (tag) {
            return tag.name;
        }
    }
});


Template.forumList.events({
    'click #newTopicButton': function(event, template) {
        Session.set('forumTemplate', 'forumNewTopic');
    }
});


Template.forumList.onCreated(function() {
    var self = this;

    self.mode = new ReactiveVar('latest');

    self.autorun(function() {
        if (landingConnection.status().connected) {
            var status = landingConnection.subscribe('forumtopics');
        }
    });
});
