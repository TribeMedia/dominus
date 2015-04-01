Meteor.startup(function() {
    Forumtags = new Mongo.Collection('forumtags', {connection:landingConnection});
});
