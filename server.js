var express = require('express');
var session = require('express-session');
var	request = require('request');
var	async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var	app = express();


var configDB = require('./app/config/database.js');
mongoose.connect(configDB.url);

require('./app/config/passport')(passport);

app.use(express.static('public'))
app.use(express.static(path.join('public/css/')));
app.use(express.static(path.join(__dirname, 'public/img/')));

app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.set('view engine', 'ejs');
app.use(session({ secret: 'xxx' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



var routes = require('./app/routes');
var posts = require('./app/postsr');
var users = require('./app/users');
app.use('/', routes, posts, users);

var port = Number(process.env.PORT || 3000);
app.listen(port);
console.log('Dziala ' + port);