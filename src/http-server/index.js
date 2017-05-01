"use strict";
const http = require('http');

module.exports = (expressApp) => {
	// Return created HTTP webserver based on Express App
	return http.createServer(expressApp);
};