const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personalProjectSchema = new Schema({
	projectName: {type:String, maxLength:64},
	tags: {type:[{type:String,maxLength:32}],default: undefined},
	imgLocation: {type:String, maxLength:256},
	description: {type:String, maxLength: 1024},
	projectLink: {type:String, maxLength:256},
	githubLink: {type:String,maxLength:256}
});

module.exports = mongoose.model("personalProject",personalProjectSchema);