"use strict";
const _ = require('underscore');

module.exports = {
	checkAccess: (req, resp, next) => {
		let accessedRoute = req.url;
		if(req.session.user) {
			switch(accessedRoute) {
				case "/":
					resp.redirect('chat');
					break;
				default:
					next();
			}
		} else {
			switch(accessedRoute) {
				case "/chat":
					resp.redirect('/');
					break;
				default:
					next();
			}
		}
	},
	logInHandler: (req, resp) => {
		if(!req.session.user) {
			// Get submitted username from user
			let reqBodyUsername = req.body.username.trim();
			
			// Check if username is empty string or not
			if(!reqBodyUsername) {
				req.flash('error', 'Please provide a valid username');
				resp.redirect('/');
			}

			// Check if we have already registered user with this username
			let checkedUser = _.find(req.app.locals.userData, (user) => {
				return reqBodyUsername == user.username;
			});

			if(checkedUser) {
				// Set flash to warn user for busy username
				req.flash('error', "Username is already in use");
			} else {
				let userData = {username: reqBodyUsername};
				req.session.user = userData;
				req.app.locals.userData.push(userData);
			}

			resp.redirect('/');
		}
	},
	logOutHandler: (req, resp) => {
		let removedUser = req.session.user;
		if(req.session.user) {
			// Destroy active session
			req.session.destroy(() => {
				console.log(`Session closed successfully for user: ${removedUser.username}`);
			});

			// Update list of active users in application
			req.app.locals.userData = _.filter(req.app.locals.userData, (user) => {
				return user.username != removedUser.username;
			});
		}
		resp.redirect('/');
	}
}