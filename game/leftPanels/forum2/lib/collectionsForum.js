Meteor.startup(function() {
    Forumtags = new Mongo.Collection('forumtags', {connection:landingConnection});
    Forumtopics = new Mongo.Collection('forumtopics', {connection:landingConnection});
    Forumposts = new Mongo.Collection('forumposts', {connection:landingConnection});
});
