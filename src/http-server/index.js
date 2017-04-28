"use strict";
const http = require('http');
const RouteClass = require('../routes');
const NodeSession = require('node-session');

// Create HTTP webserver
let webServerInstance = http.createServer((request, response) => {

	new Promise(function(resolve, reject) {
		// Configure session
		let session = new NodeSession({secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD'});

		// Start new session
		session.startSession(request, response, () => {
			resolve({req: request, resp: response});
		});
	}).then((serverData) => {
		let request = serverData.req;
		// Will return a Promise with route information
		let routeSettings = RouteClass.renderHTTPResponse(request);
		routeSettings.then((settings) => {
			response.writeHead(settings.statusCode, settings.headers);
			response.write(settings.content);
			response.end();
		});
	}, (rejectionMessage) => {
		console.error(rejectionMessage);
	});
});

module.exports = webServerInstance;