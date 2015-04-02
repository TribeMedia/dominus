Template.forumList.events({
    'click #newTopicButton': function(event, template) {
        Session.set('forumTemplate', 'forumNewTopic');
    }
});
