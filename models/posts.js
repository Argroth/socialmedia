var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema = new Schema({
	title: String,
	content: String,
	autor: String
});

var Post = mongoose.model('posts', postsSchema);
module.exports = Post;