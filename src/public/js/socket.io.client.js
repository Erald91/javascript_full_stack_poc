"use strict";
(() => {
	let init = () => {
		let loggedUserNameID = $('#user-name-id').text();
		let $sendButton = $('#send-button');
		let $messageTextarea = $('#user-message');
		let $chatListContainer = $('.chat-list');
		let socket = io();

		// Send message on pressing "Enter" button
		$messageTextarea.on('keypress', (event) => {
			if(event.keyCode == 13) {
				event.preventDefault(); 
				_sendMessage();
			}
		});

		// Send message on pressing "Send" button
		$sendButton.on('click', (event) => {
			_sendMessage();
		});

		// Check if user is marked as active
		socket.on('verify-user', (userData) => {
			console.log(userData);
			let filteredUser = userData.filter((userInfo) => {
				return loggedUserNameID == userInfo.username;
			});
			if(!filteredUser.length) {
				alert('You are logged out from application');
				location.href = "/";
			}
		});

		// Update chat history after each new message added
		socket.on('chat-history', (chatHistory) => {
			$chatListContainer.empty();
			console.log(chatHistory);
			if(!chatHistory.length) {
				// Prepare <li> instance to append to list
				let $li = $('<li></li>')
						  .html('<i class="fa fa-times-circle empty-sign" aria-hidden="true"></i> No messages found')
						  .attr({'class': 'set-text-center '});

				$chatListContainer.append($li);
			} else {
				$.each(chatHistory, (i, _details) => {
					let messageDate = _details.date.toString();
					let readableDateFormat = messageDate.replace("T", " ").substr(0, messageDate.indexOf("."));
					let todayDate = (new Date()).getTime(); // today time in seconds
					let messageDateSeconds = (new Date(readableDateFormat)).getTime(); // message posted time in seconds
					let messageOwner = _details.username;
					let $deleteButton = "";

					if(todayDate - messageDateSeconds < 15*60 && messageOwner == loggedUserNameID) {
						let $deleteButton = $('<span></span>')
											.html('<i class="fa fa-minus-circle" aria-hidden="true"></i>')
											.attr({'class': 'delete-message'})
											.on('click', (event) => {
												socket.emit('delete-message', _details);
											});
					}

					// Define <li> component content related with message details
					let _componentContent = `<span class="message-username">${messageOwner}</span> 
											on 
											<span class="message-date">${readableDateFormat}</span> ${$deleteButton}
											<br>
											<span class="message-content">${_details.message}</span>`;
					// Prepare <li> instance to append to list
					let $li = $('<li></li>')
							 .html(_componentContent)
							 .attr({'class': 'message-container'});

					$chatListContainer.append($li);
				});
			}
		});

		// Push message in socket
		function _sendMessage() {
			let userMessage = $messageTextarea.val().trim();
			let allowedPattern = /[\w\d\.\,\?\!\:\"\']+/g;
			if(allowedPattern.test(userMessage)) {
				socket.emit('message', {
					username: loggedUserNameID, 
					date: new Date(), 
					message: userMessage
				});
				$messageTextarea.val("");
			} else {
				alert("Message must not be empty and are allowed only alphanumeric values along with . , ? ! : “ '");
			}
		}
	}

	$(document).ready((event) => {
		init();
	});
})();