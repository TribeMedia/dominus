Template.forumList.helpers({
    tags: function() {
        return Forumtags.find({});
    },

    topics: function() {
        var sort = {};
        switch(Session.get('forumSort')) {
            case 'post':
                sort['updatedAt'] = -1;
                break;
            case 'topic':
                sort['createdAt'] = -1;
                break;
            case 'numPosts':
                sort['numPosts'] = -1;
                break;
        }

        return Forumtopics.find({}, {sort:sort});
    },

    isSelectedCategory: function() {
        if (Session.get('forumCategory') == this._id) {
            return 'selected';
        }
    },

    isAllSelectedCategory: function() {
        if (Session.get('forumCategory') == 'all') {
            return 'selected';
        }
    }
});


Template.forumList.events({
    'click #newTopicButton': function(event, template) {
        Session.set('forumTemplate', 'forumNewTopic');
    },

    'click #showMoreButton': function(event, template) {
        var numShow = Session.get('forumNumShow');
        if (numShow && numShow < 200) {
            Session.set('forumNumShow', numShow+5);
        }
    },

    'change #forumTagSelect': function(event, template) {
        var tagId = event.currentTarget.value;
        Session.set('forumCategory', tagId);
    },

    'click #forumLatestButton': function() {
        Session.set('forumSort', 'post');
    },

    'click #forumNewButton': function() {
        Session.set('forumSort', 'topic');
    },

    'click #forumTopButton': function() {
        Session.set('forumSort', 'numPosts');
    }
});


Template.forumList.onCreated(function() {
    var self = this;

    // post, topic, numPosts
    Session.setDefault('forumSort', 'post');

    // all or tagId
    Session.setDefault('forumCategory', 'all');

    // all, pastMonth
    Session.setDefault('forumFilter', 'all');

    // pagination
    Session.set('forumNumShow', 10);

    self.autorun(function() {
        if (landingConnection.status().connected) {
            var status = landingConnection.subscribe('forumtopics',
            Session.get('forumSort'),
            Session.get('forumNumShow'),
            Session.get('forumCategory'),
            Session.get('forumFilter')
            );
        }
    });
});
