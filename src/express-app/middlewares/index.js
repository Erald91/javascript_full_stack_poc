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
                // If user is returning will check if he is active
                if(!Boolean(checkedUser.isActive)) {
                    //Make user active again
                    _.each(req.app.locals.userData, (user) => {
                        if(user.username == checkedUser.username) {
                            user.isActive = true;
                            // Create new session to give access to chat
                            req.session.user = user;
                        }
                    });
                } else {
                    // Set flash to warn user for busy user account
                    req.flash('error', "Username is already in use");
                }
            } else {
                let userData = {username: reqBodyUsername, isActive: true, color: "#000000"};
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
            // When session is closed user will be marked as inactive
            _.each(req.app.locals.userData, (user) => {
                if(user.username == removedUser.username) {
                    user.isActive = false;
                }
            });
        }
        resp.redirect('/');
    },
    customErrorHandler: (error, req, resp, next) => {
        if(error) resp.end(`[ERROR] This error happened: ${error.message}`);
    }
}