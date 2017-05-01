"use strict";
let expressApp = require('./express-app');
let httpServer = require('./http-server')(expressApp);
let io = require('socket.io')(httpServer);

// Configure Web-Socket
require('./web-socket')(io, expressApp);

// Initialize HTTP webserver to listen in port 3000
httpServer.listen(3000);

// Print HTTP server status
console.log('Server running at http://localhost:3000');