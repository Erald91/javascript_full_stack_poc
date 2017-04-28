"use strict";
const fs = require('fs');
const qs = require('querystring');
const _ = require('underscore');

class RouteManager {
	static renderHTTPResponse(requestObject) {
		let reqPathname = requestObject.url;
		let requestMethod = requestObject.method;
		let sessionProperty = requestObject.session;
		requestObject.activeUsers = requestObject.activeUsers || [];
		let responseObject = {
			headers: {
				'Content-Type': 'text/html'
			}
		};

		let filePath = null;
		switch(reqPathname) {
			case "/login":
			case "/":
				filePath = __dirname + '/../static/login.html';
				break;
			case "/css/style.css":
				filePath = __dirname + '/../static/css/style.css';
				break;
			case "/chat":
				filePath = __dirname + '/../static/chat.html';
				break;
			default: 
				filePath = "";
		}

		return new Promise((resolve, reject) => {
			// Manage POST request for login
			if(requestMethod === "POST" && reqPathname == '/login') {
				let requestBody = "";
				let formData = "";

				// Get body content from POST request
				requestObject.on('data', (data) => {
					requestBody += data;
				});

				requestObject.on('end', () => {
					formData = qs.parse(requestBody);

					// Check if user is registered in application
					let checkUser = _.find(requestObject.activeUsers, (userRecord) => {
						return userRecord.username == formData.username;
					});

					if(!checkUser) {
						requestObject.activeUsers.push({username: formData.username});
					}
				});
			}

			// Check if required route is registered
			if(!filePath) {
				responseObject.content = `Server could not reach undefined route: ${reqPathname}`;
				responseObject.statusCode = 404;
				resolve(responseObject);
			}

			// Retrieve content of required route
			fs.readFile(filePath, (err, data) => {
				if(err) {
					responseObject.content = err.message;
					responseObject.statusCode = 500;
				} else {
					responseObject.content = data.toString();
					responseObject.statusCode = 200;
				} 
				resolve(responseObject);
			});
		});
	}
}

module.exports = RouteManager;