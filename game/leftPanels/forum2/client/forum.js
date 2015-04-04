Template.forum.helpers({
    template: function() {
        return Session.get('forumTemplate');
    }
});



Template.forum.onCreated(function() {
    Session.setDefault('forumTemplate', 'forumList');

    this.autorun(function() {
        if (landingConnection.status().connected) {
            landingConnection.subscribe('forumtags');

            var profile = Profiles.findOne({}, {fields:{_id:1}});
            if (profile) {
                landingConnection.subscribe('forumReadsByProfile', profile._id);
            }
        }
    });
});


Template.forum.onRendered(function() {
    this.firstNode.parentNode._uihooks = leftPanelAnimation;
});
