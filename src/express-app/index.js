"user strict";
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const session = require('express-session');
const customMiddlewares = require('./middlewares');
const expressFlash = require('express-flash');

// Define Express application
let app = express();

// Define application middlewares 
app.use(express.static(path.join(__dirname, '/../public')));
app.use(express.static(path.join(__dirname, '/../bower_components')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: "HjklyThucdserkIhs258746",
    resave: false,
    saveUninitialized: false
}));
app.use(expressFlash());

// Store users and chat data
app.locals.userData = [];
app.locals.chatHistory = [];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/../views'));

// Define application routes
app.get('/', customMiddlewares.checkAccess, (req, resp) => {
    resp.render('login');
});

app.get('/chat', customMiddlewares.checkAccess, (req, resp) => {
    resp.render('chat', {user: req.session.user});
});

app.post('/login', customMiddlewares.logInHandler);

app.get('/logout', customMiddlewares.logOutHandler);

app.use(customMiddlewares.customErrorHandler);

// Export Express application
module.exports = app;