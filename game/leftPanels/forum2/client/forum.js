Template.forum.helpers({
    template: function() {
        return Session.get('forumTemplate');
    }
});



Template.forum.onCreated(function() {
    Session.setDefault('forumTemplate', 'forumList');

    this.autorun(function() {
        if (landingConnection.status().connected) {
            var status = landingConnection.subscribe('forumtags');
        }
    });
});
