var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');
var passport = require('passport');

var Post = require('./models/posts.js');
var Wall = require('./models/wall.js');
var User = require('./models/user.js');

router.get('/users', isLoggedIn, isAdmin, function(req, res){
	User.find({}, function(err, users){
		res.render('users', {
			user: users
		});
	});
});

router.get('/users/:users_id', function(req, res){

	User.find({_id: req.params.users_id}, function(err, users){
		Wall.find({autor: req.params.users_id}, function(err, walls){
						res.render('viewuser.ejs', {
				user: users,
				walls: walls
			});
		});
		Wall.find({}, function(err, walls){
			console.log(walls);
		});
	});
});

router.get('/delete/user/:users_id', function(req, res){
	User.findByIdAndRemove({_id: req.params.users_id},function(err, users){
		if(err) throw err;
		var response = {
			message: "usunięto usera"
		};
		console.log(response);
	});
	Wall.findByIdAndRemove({autor: req.params.users_id}, function(err, walls){
	res.redirect('/users');
	})

});

router.get('/edit/user/:users_id', function(req, res){
  console.log(req.params.users_id);
  User.find({_id: req.params.users_id}, function(err, users){
    res.render('edituser.ejs',{
      users
    });
  });
});

router.post('/update/user/:users_id', function(req, res){
  User.findById({_id: req.params.users_id}, function(err, users){
    if(err) throw err;

    users.local.role = req.body.role;

    users.save(function(err){
      if(err) throw err;
    });
    res.redirect('/users');
  });
});

router.post('/blog/:users_id', function(req, res){
	var wall = new Wall({
		title: req.body.title,
		content: req.body.content,
		autor: req.params.users_id,
	});

	wall.save(function(err, walls){
		if(err) throw err;
	});
	res.redirect('/users/' + req.params.users_id);
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
};

function isAdmin(req, res, next){
  console.log(req.user.local.role);
  if(req.user.local.role == "Admin")
    return next();
  res.redirect('/');
};

module.exports = router