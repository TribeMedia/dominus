Meteor.startup(function() {
    if (Meteor.isClient) {
        Forumtags = new Mongo.Collection('forumtags', {connection:landingConnection});
        Forumtopics = new Mongo.Collection('forumtopics', {connection:landingConnection});
        Forumposts = new Mongo.Collection('forumposts', {connection:landingConnection});

        // contains profileId, topicId, date created
        // unique by profileId && topicId
        // if someone responds to topic delete all by topicId
        // delete if date created is older than one month
        // topics updated more than one month ago are not new
        Forumreads = new Mongo.Collection('forumreads', {connection:landingConnection});

        // this contains the date of the most recent post
        // used in the top menu to tell if there is a new forum post
        // since the last time they closed the forum panel
        Forumlatestpost = new Mongo.Collection('forumlatestpost', {connection:landingConnection});
    }
});
