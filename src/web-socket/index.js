"use strict";
const _ = require('underscore');

module.exports = (io, expressApp) => {
	io.on('connection', (socket) => {
		// Check in server if user is marked as active one
		socket.emit('verify-user', expressApp.locals.userData);
		// Update chat history for all open sockets
		io.sockets.emit('chat-history', expressApp.locals.chatHistory);
		// Listen to event when new message is submitted
		socket.on('message', (messageObject) => {
			// Push new message into chat history
			expressApp.locals.chatHistory.push(messageObject);
			io.sockets.emit('chat-history', expressApp.locals.chatHistory);
		});
		// Remove message from chat history
		socket.on('delete-message', (messageObject) => {
			expressApp.locals.chatHistory = _.filter(expressApp.locals.chatHistory, (message) => {
				return message.date.toString() + message.username != messageObject.date.toString() + messageObject.username;
			});
			io.sockets.emit('chat-history', expressApp.locals.chatHistory);
		});
	});
}