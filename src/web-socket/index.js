"use strict";
const _ = require('underscore');

module.exports = (io, expressApp) => {
    io.on('connection', (socket) => {
        // Check in server if user is marked as active one
        socket.emit('verify-user', expressApp.locals.userData);

        // Update chat history for all open sockets when connection is estabilished
        io.sockets.emit('chat-history', [expressApp.locals.chatHistory, expressApp.locals.userData]);
        
        // Listen to event when new message is submitted
        socket.on('message', (messageObject) => {
            let allowedPattern = /^[a-zA-Z0-9\s\.\,\?\!\:\"\']+$/;
            if(allowedPattern.test(messageObject.message)) {
                // Push new message into chat history
                expressApp.locals.chatHistory.push(messageObject);
            } else {
                // Send error message to user for wrong message format
                socket.emit('chat-error', {
                    'type': 'message', 
                    'content': "Message must not be empty and are allowed only alphanumeric values along with . , ? ! : “ '",
                    'message': messageObject.message
                });
            }
        });

        // Remove message from chat history
        socket.on('delete-message', (messageObject) => {
            expressApp.locals.chatHistory = _.filter(expressApp.locals.chatHistory, (message) => {
                return message.date.toString() + message.username != messageObject.date.toString() + messageObject.username;
            });
        });

        // Update message color for specific user
        socket.on('change-color', (colorData) => {
            _.each(expressApp.locals.userData, (user) => {
                if(user.username == colorData.username) user.color = colorData.color;
            });
        });

        // Update chat history periodically
        setInterval(() => {
            io.sockets.emit('chat-history', [expressApp.locals.chatHistory, expressApp.locals.userData]);
        }, 1000);
    });
}