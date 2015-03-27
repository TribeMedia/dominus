Template.landing.helpers({
	form: function() {
		return Session.get('landingForm')
	},

	startText: function() {
		var start = moment(new Date(s.game_start_date))
		if (moment().isAfter(start)) {
			// game has already started
			return 'Game '+s.game_number+' started '+ start.fromNow()+'.'
		} else {
			// game has not started yet
			return 'Game '+s.game_number+' starts in '+ start.fromNow()+'.'
		}
	},

	gameName: function() {

	},

	gameDescription: function() {
		
	}
})


Template.landing.rendered = function() {
	setViewport()
	setBackground()
	window.onresize = function() {
		setViewport()
		setBackground()
	}
}


Template.landing.created = function() {
	var self = this

	Session.set('landingForm', 'landingCreateAccount')

	this.subscribe('playerCount');
}

var setBackground = function() {
	document.body.style.backgroundColor = '#111';
	document.body.style.backgroundImage = 'url(/landing/landingBg.jpg)';
	document.body.style.backgroundPosition = 'center top';
	document.body.style.backgroundRepeat = 'no-repeat';
	document.body.style.backgroundSize = 'cover';
	document.body.style.backgroundAttachment = 'fixed';
}


// set viewport for mobile
var setViewport = function() {
	var pageWidth = 550
	var zoom = screen.width / pageWidth
	if (zoom < 1) {
		var tag = document.getElementById('viewport')
		var content = 'initial-scale='+zoom+', maximum-scale='+zoom+', minimum-scale='+zoom+', user-scalable=no, width='+pageWidth
		tag.setAttribute('content', content)
	} else {
		var tag = document.getElementById('viewport')
		var content = 'initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, width=device-width'
		tag.setAttribute('content', content)
	}
}



// animation

var loginFormRendered = function() {
	this.find('.formContainer').parentNode._uihooks = landingLoginFormAnimation
}

Template.landingSignin.rendered = loginFormRendered
Template.landingCreateAccount.rendered = loginFormRendered
Template.landingForgotPassword.rendered = loginFormRendered