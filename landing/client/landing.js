Template.landing.helpers({
	gameHasStarted: function() {
		return Session.get('gameHasStarted');
	},

	form: function() {
		return Session.get('landingForm');
	},

	gameStartDate: function() {
		var s = Settings.findOne({name:'gameStartDate'});
		if (s) {
			return s.value;
		}
	},

	gameName: function() {
		var s = Settings.findOne({name:'gameName'});
		if (s) {
			return s.value;
		}
	},

	gameDescription: function() {
		var s = Settings.findOne({name:'gameDescription'});
		if (s) {
			return s.value;
		}
	},

	dominusBase: function() {
		var s = Settings.findOne({name:'dominusBase'});
		if (s) {
			return s.value;
		}
	}
});


Template.landing.rendered = function() {
	setViewport();
	setBackground();
	window.onresize = function() {
		setViewport();
		setBackground();
	};
};


Template.landing.onCreated(function() {
	var self = this;

	// navigation
	// show create account or signin or forgot password
	Session.setDefault('landingForm', 'landingCreateAccount');

	Session.setDefault('gameIsFull', null);
	Session.setDefault('gameHasStarted', null);

	this.subscribe('playerCount');
	this.subscribe('gameStartDate');
	this.subscribe('gameName');
	this.subscribe('gameDescription');
	this.subscribe('dominusBase');

	this.autorun(function() {
		if (Template.instance().subscriptionsReady()) {
			// has game started
			var s = Settings.findOne({name:'gameStartDate'});
			if (s) {
				var startDate = moment(new Date(s.value));
				if (moment().isAfter(startDate)) {
					Session.set('gameHasStarted', true);
				} else {
					Session.set('gameHasStarted', false);
				}
			}

			// is game full
			s = Settings.findOne({name:'playerCount'});
			if (s) {
				var numPlayers = s.value;
				if (numPlayers >= s.serverMaxPlayers) {
					Session.set('gameIsFull', true);
				} else {
					Session.set('gameIsFull', false);
				}
			}
		}
	});
});

var setBackground = function() {
	document.body.style.backgroundColor = '#111';
	document.body.style.backgroundImage = 'url(/landing/landingBg.jpg)';
	document.body.style.backgroundPosition = 'center top';
	document.body.style.backgroundRepeat = 'no-repeat';
	document.body.style.backgroundSize = 'cover';
	document.body.style.backgroundAttachment = 'fixed';
};


// set viewport for mobile
var setViewport = function() {
	var pageWidth = 550;
	var zoom = screen.width / pageWidth;
	var tag;
	var content;
	if (zoom < 1) {
		tag = document.getElementById('viewport');
		content = 'initial-scale='+zoom+', maximum-scale='+zoom+', minimum-scale='+zoom+', user-scalable=no, width='+pageWidth;
		tag.setAttribute('content', content);
	} else {
		tag = document.getElementById('viewport');
		content = 'initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, width=device-width';
		tag.setAttribute('content', content);
	}
};



// animation

var loginFormRendered = function() {
	this.find('.formContainer').parentNode._uihooks = landingLoginFormAnimation;
};

Template.landingSignin.rendered = loginFormRendered;
Template.landingCreateAccount.rendered = loginFormRendered;
Template.landingForgotPassword.rendered = loginFormRendered;
