Template.forum.helpers({
    tags: function() {
        return Forumtags.find();
    }
});


Template.forum.onCreated(function() {
    this.autorun(function() {
        if (landingConnection.status().connected) {
            console.log('subscribing to forumtags')
            var status = landingConnection.subscribe('forumtags');
            console.log(status.ready())
        }
    });
});
