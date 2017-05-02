"use strict";
(() => {
    let init = () => {
        let loggedUserNameID = $('#user-name-id').text();
        let $sendButton = $('#send-button');
        let $messageTextarea = $('#user-message');
        let $chatListContainer = $('.chat-list');
        let $colorPicker = $('select[name=color-picker]');
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
            let allowed = true;
            let user = null;

            let filteredUser = userData.filter((userInfo) => {
                return loggedUserNameID == userInfo.username;
            });

            if(!filteredUser.length) {
                allowed = false
            } else {
                [user] = filteredUser;
                if(!Boolean(user.isActive)) allowed = false;
            }

            // Redirected user to login page to resubmit credentials
            if(!allowed) {
                alert('You are logged out from application');
                location.href = "/"; 
            }

            // Change color picker value based on user preference
            if(user) $colorPicker.simplecolorpicker('selectColor', user.color);
        });

        // Manage event for cases when message color is changed
        $colorPicker.on('change', (event) => {
            socket.emit('change-color', {username: loggedUserNameID, color: $(event.target).val()});
        });

        // Update chat history after each new message added
        socket.on('chat-history', (chatData) => {
            let [chatHistory, chatUserData] = chatData;
            
            // Empty list message from previous values
            $chatListContainer.empty();
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
                    let messageOwner = _details.username;
                    let messageColor = _defineColor(chatUserData, messageOwner);
                    let $deleteButton = _deleteButton(_details);

                    // Define <li> component content related with message details
                    let _componentContent = `<span class="message-username">${messageOwner}</span> 
                                            on 
                                            <span class="message-date">${readableDateFormat}</span> wrote:
                                            <br>
                                            <span style="color: ${messageColor};">${_details.message}</span>`;
                    // Prepare <li> instance to append to list
                    let $li = $('<li></li>')
                             .html(_componentContent)
                             .attr({'class': 'message-container'});

                    // Prepend delete button for message if not older than 15 minutes
                    if($deleteButton) $li.prepend('<br>').prepend($deleteButton);

                    $chatListContainer.append($li);
                });
            }
        });

        // Manage chat error events
        socket.on('chat-error', (errorObject) => {
            let type = errorObject.type;
            switch(type) {
                case "message":
                    $messageTextarea.val(errorObject.message);
                    alert(errorObject.content);
                    break;
                default: 
                    alert('Unhandled error type');
                    console.error(errorObject);
            }
        })

        // Push message in socket
        function _sendMessage() {
            let userMessage = $messageTextarea.val().trim();
            socket.emit('message', {
                username: loggedUserNameID, 
                date: new Date(), 
                message: userMessage
            });
            $messageTextarea.val("");
        }

        // Generate delete button for chat messages
        function _deleteButton(messageObject, loggedUser = loggedUserNameID) {
            let messageDateMs = (new Date(messageObject.date)).getTime();
            let todayDateMs = (new Date()).getTime();

            // Generate delete button if message is not older than 15 minutes
            if(todayDateMs - messageDateMs < 15*60*1000 && messageObject.username == loggedUser) {
                return $('<span></span>')
                        .html('<i class="fa fa-minus-circle" aria-hidden="true"></i>')
                        .attr({'class': 'delete-message'})
                        .on('click', (event) => {
                            console.log('Clicked!!!')
                            socket.emit('delete-message', messageObject);
                        });
            } else {
                return ""; 
            }
        }

        // Define message color
        function _defineColor(chatUserData, loggedUser = loggedUserNameID) {
            let userData = chatUserData.find((user) => {
                return user.username == loggedUser;
            });

            if(userData) return userData.color;
            else "#000000";
        }
    }

    $(document).ready((event) => {
        init();
    });
})();