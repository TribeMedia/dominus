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

            var prefs = Prefs.findOne({}, {fields:{_id:1}});
            if (prefs) {
                landingConnection.subscribe('forumReadsByPrefs', prefs._id);
            }
        }
    });
});


Template.forum.onRendered(function() {
    this.firstNode.parentNode._uihooks = leftPanelAnimation;
});
