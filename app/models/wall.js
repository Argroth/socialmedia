var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var wallSchema = new Schema({
	title: String,
	content: String,
	autor: String
});

var Wall = mongoose.model('walls', wallSchema);
module.exports = Wall;