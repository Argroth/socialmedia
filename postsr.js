var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');
var passport = require('passport');

var Post = require('./models/posts.js');
var Wall = require('./models/wall.js');


router.get('/posts', isLoggedIn, isAdmin,  function(req, res){
  Post.find({}, function(err, posts){
    res.render('posts.ejs', {
      post: posts
    });
  });
});



router.post('/post', isAdmin, function(req, res){
  var post = new Post({
    title: req.body.title,
    content: req.body.content
  });

  post.save(function(err, posts){
    if(err) throw err;

    res.redirect('/posts');
  });
});

router.get('/posts/:posts_id', function(req, res){
  Post.find({_id: req.params.posts_id}, function(err, posts){
      res.render('viewpost.ejs',{
         post: posts
    });
  });
});

router.get('/viewpost/:posts_id', function(req, res){
  Post.find({_id: req.params.posts_id}, function(err, posts){
    res.render('viewpost.ejs',{
      posts
    });
  });
});

router.post('/update/:posts_id', isLoggedIn, isAdmin, function(req, res){
  Post.findById({_id: req.params.posts_id}, function(err, posts){
    if(err) throw err;
    posts.title = req.body.title;
    posts.content = req.body.content;

    posts.save(function(err){
      if(err) throw err;
    });
    res.redirect('/posts');
  });
});

router.get('/edit/post/:posts_id', isLoggedIn, isAdmin, function(req, res){
  console.log(req.params.posts_id);
  Post.find({_id: req.params.posts_id}, function(err, posts){
    res.render('editpost.ejs',{
      posts
    });
  });
});

router.get('/delete/post/:posts_id', isLoggedIn, isAdmin, function(req, res){
  Post.findByIdAndRemove({_id: req.params.posts_id},function(err, posts){
    if(err) throw err;
    var response = {
      message: "usunięto post: ",
      id: posts._id
    };
    console.log(response);
    res.redirect('/posts');
  });

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