Template.forumNewPost.events({
    'click #newPostButton': function(event, template) {
        var textarea = template.find('#newPostTextarea');
        var text = textarea.value;
        var alert = template.find('#newPostAlert');
        var button = event.currentTarget;
        var buttonText = $(button).text();

        $(button).text('Creating Post...');
        $(button).prop('disabled', true);
        $(alert).hide();

        Meteor.call('forumNewPost', template.data.tagId, template.data._id, text, function(error, result) {
            $(button).text(buttonText);
            $(button).prop('disabled', false);

            if (error) {
                $(alert).show();
                $(alert).text(error.error);
            } else {
                $(textarea).text('');
            }
        });
    }
});
