Template.forumTopic.helpers({
    posts: function() {
        return Forumposts.find();
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
                if (Template.currentData()) {
                    var status = landingConnection.subscribe('forumTopicAndPosts', topicId);
                }
            }
        }
    });
});
