Template.forumNewTopic.helpers({
    tags: function() {
        return Forumtags.find();
    }
});


Template.forumNewTopic.events({
    'click #saveNewTopicButton': function(event, template) {
        var title = template.find('#topicTitleInput').value;
        var tag = template.find('#topicTagSelect').value;
        var text = template.find('#topicTextarea').value;
        var alert = template.find('#topicAlert');
        var button = event.currentTarget;
        var buttonText = $(button).text();

        $(button).text('Creating Topic...');
        $(button).prop('disabled', true);
        $(alert).hide();

        Meteor.call('forumNewTopic', title, tag, text, function(error, result) {
            $(button).text(buttonText);
            $(button).prop('disabled', false);

            if (error) {
                $(alert).show();
                $(alert).text(error.error);
            } else {
                Session.set('forumTemplate', 'forumList');
            }
        });
    },

    'click #cancelNewTopicButton': function(event, template) {
        Session.set('forumTemplate', 'forumList');
    },
});
