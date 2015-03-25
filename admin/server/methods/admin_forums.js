Meteor.methods({

	admin_setupDefaultForums: function() {
		if (get_user_property("admin")) {
			var forums = Forums.find()
			if (forums) {
				// only continus if there are no forums
				if (forums.count() == 0) {
					Meteor.call('admin_create_forum', 'Dominus News', '')
					Meteor.call('admin_create_forum', 'Dominus General', '')
					Meteor.call('admin_create_forum', 'Feature Requests', 'The Dominus roadmap is on <a href="https://trello.com/b/q40VdLBJ/dominus">Trello</a>.  Vote for features you would like added soon.')
					Meteor.call('admin_create_forum', 'Report a Bug', 'Bugs are tracked on <a href="https://github.com/dan335/dominus/issues">Github</a>.')
					Meteor.call('admin_create_forum', 'Everything Else', 'Anything not related to Dominus.')
				}
			}
		}
	},

	admin_create_forum: function(name, desc) {
		if (get_user_property("admin")) {
			createForum(name, desc);
		}
	},

	admin_delete_forum: function(id) {
		if (get_user_property("admin")) {
			Forums.remove(id)
			Latestmessages.remove({forum_id:id})
		}
	},

	admin_forum_move_up: function(id) {
		if (get_user_property("admin")) {
			var forum = Forums.findOne(id)
			Forums.update({order: forum.order-1}, {$set: {order: forum.order}})
			Forums.update(id, {$set: {order: forum.order-1}})
		}
	},

	admin_forum_move_down: function(id) {
		if (get_user_property("admin")) {
			var forum = Forums.findOne(id)
			Forums.update({order: forum.order+1}, {$set: {order: forum.order}})
			Forums.update(id, {$set: {order: forum.order+1}})
		}
	}

})


setupDefaultForums = function() {

	// only create forums if there are no forums
	var forums = Forums.find()
	if (forums && forums.count() != 0) {
		return;
	}

	console.log('--- setting up forums ---');
	
	createForum('Dominus News', '');
	createForum('Dominus General', '');
	createForum('Feature Requests', 'The Dominus roadmap is on <a href="https://trello.com/b/q40VdLBJ/dominus">Trello</a>.  Vote for features you would like added soon.');
	createForum('Report a Bug', 'Bugs are tracked on <a href="https://github.com/dan335/dominus/issues">Github</a>.');
	createForum('Everything Else', 'Anything not related to Dominus.');
}


createForum = function(name, desc) {
	desc = desc.replace(/\r?\n/g, '<br />');

	if (desc.length < 1) {
		desc = null;
	}

	if (name.length > 1) {
		Forums.insert({
			name: name,
			description: desc,
			order: Forums.find().count(),
			numThreads: 0,
			numMessages: 0,
			created_at: new Date(),
			updated_at: new Date()
		});
	}
}