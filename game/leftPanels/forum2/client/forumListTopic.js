Template.forumListTopic.helpers({
    tagName: function() {
        var tag = Forumtags.findOne(this.tagId);
        if (tag) {
            return tag.name;
        }
    },

    isNewTopic: function() {
        var num = Forumreads.find({topicId:this._id}).count();
        return num === 0;
    }
});

Template.forumListTopic.events({
    'click .forumListTopicLink': function(event, template) {
        Session.set('forumTopicId', template.data._id);
        Session.set('forumTemplate', 'forumTopic');
    }
});
