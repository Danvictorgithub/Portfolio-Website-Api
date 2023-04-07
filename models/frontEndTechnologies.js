const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const frontEndTechSchema = new Schema({
	name:{type:String, maxLength:32},
	imgLocation:{type:String}
});

module.exports = mongoose.model("frontEndTech",frontEndTechSchema);