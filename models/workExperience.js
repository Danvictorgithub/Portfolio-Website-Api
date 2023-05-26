const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workExperienceSchema = new Schema({
	positionName:{type:String,maxLength:32},
	companyName: {type:String,maxLength:32},
	startDate: {type:String,maxLength:16},
	endDate: {type:String,maxLength:16},
	description: {type:String,maxLength:256}
});
module.exports = mongoose.model("workExprience",workExperienceSchema);