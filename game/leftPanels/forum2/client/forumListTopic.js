Template.forumListTopic.events({
    'click .forumListTopicLink': function(event, template) {
        Session.set('forumTopicId', template.data._id);
        Session.set('forumTemplate', 'forumTopic');
    }
});
