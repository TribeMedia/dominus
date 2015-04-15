Template.forumTopic.helpers({
    posts: function() {
        return Forumposts.find();
    },

    topic: function() {
        var topicId = Session.get('forumTopicId');
        if (topicId) {
            return Forumtopics.findOne(topicId);
        }
    },

    tag: function() {
        var topicId = Session.get('forumTopicId');
        if (topicId) {
            var topic = Forumtopics.findOne(topicId);
            if (topic) {
                return Forumtags.findOne(topic.tagId);
            }
        }
    }
});


Template.forumTopic.events({
    'click .gotoForumListButton': function(event, template) {
        Session.set('forumTemplate', 'forumList');
    }
});


Template.forumTopic.onCreated(function() {
    var self = this;

    self.autorun(function() {
        var topicId = Session.get('forumTopicId');
        if (topicId) {
            if (landingConnection.status().connected) {
                var status = landingConnection.subscribe('forumTopicAndPosts', topicId);
            }
        }
    });

    // mark as read
    Meteor.call('forumTopicReadByUser', Session.get('forumTopicId'));
});
