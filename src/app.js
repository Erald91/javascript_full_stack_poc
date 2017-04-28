"use strict";
var httpServer = require('./http-server');

// Initialize HTTP webserver to listen in port 3000
httpServer.listen(3000);

// Print HTTP server status
console.log('Server running at http://localhost:3000');