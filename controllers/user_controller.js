const { 
	getStorage, 
	ref, 
	uploadBytes, 
	getDownloadURL
} = require("firebase/storage");
const User = require("../models/user.js");
const FeTech = require("../models/frontEndTechnologies.js");
const BeTech = require("../models/backEndTechnologies.js");
const workExp = require("../models/workExperience.js");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const {body,validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
exports.login_POST = (req,res) => {
	passport.authenticate('local',{session:false},(err,user,info) => {

		// session is set to false since API is used for authentication
		
		if (err || !user) {
			return res.status(400).json({
				message: "Invalid Password",
				user: user
			});
		}	
		req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
			jwt.sign({user}, process.env.SECRET_KEY,(err,token)=>{
				if (err) {
					return res.status(400).json({
						message: "Something is not right",
					});
				}
				return res.json({user, token});
			});
		   });
	})(req,res);
};
exports.signup_POST = [
	body('username').trim().isLength({min:8,max:16}).withMessage("Username is either less than 8 or greater than 16").escape(),
	body('password').trim().isLength({min:8,max:128}).withMessage("Password is either less than 8 or greater than 128").escape(),
	(req,res)=> {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({errors:errors.array()});
		}
		User.findOne({username:req.body.username}).then((result)=> {
			if (result != undefined) {
				return res.status(400).json({message:"User Already Exist"});
			}
			bcrypt.hash(req.body.password,12,(err,token)=> {
				if (err) {
					return res.status(400).json({message:"Unexpected Error"});
				}
				const newUser = new User({
					username: req.body.username,
					password: token,
				});
				newUser.save();
				res.status(201).json({message:"Successfully created a new User"});
			});
		})
		return;
	}
];
const processImageMiddleware = require('../configs/multer-config.js'); // multer config for form-data
class FirebaseImageOperator {
	constructor(firebaseRef,modelObj,reqObj,resObj) {
		this.firebaseRef = firebaseRef;
		this.model = modelObj;
		this.req = reqObj;
		this.res = resObj;
	}
	//upload => fileBuffer:bufferBytes, fileMetadata:metadataObj ;
		// uploads bytes to firebase storage and outputs url
		// which to be use on new document from the schema
		// returns if successful otherwise error
	upload(fileBuffer,fileMetadata) {
		uploadBytes(this.firebaseRef,fileBuffer,fileMetadata)
			.then(()=> {
				getDownloadURL(this.firebaseRef).then(url => {
					const newTech = new this.model({
						name:this.req.body.name,
						imgLocation:url
					});
					newTech
						.save()
						.then((document)=> {
						console.log("Added new Front End Technologies: ",document.name);
						return this.res.json({message:"File Uploaded Successfully"});
					})
						.catch((err)=> {
							return this.res.status(400).json({error:err});
						});
				});
			})
			.catch(err => this.res.status(400).json({error:err}));
	}
}
exports.get_we = (req,res,next) => {
	workExp.find({})
	.then(result => 
		res.status(200).json({message:"Successful",WorkExp:result})
	)
	.catch(err=> 
		res.status(400).json({message:"Unexpected Error"})
	);
}
exports.post_we = [
	body("positionName").trim().isLength({max:32}).withMessage("Position Name must be less than 32 characters").escape(),
	body("companyName").trim().isLength({max:32}).withMessage("Company Name must be less than 32 characters").escape(),
	body("startDate").trim().isLength({max:16}).withMessage("Start Date must be less than 16 characters").escape(),
	body("endDate").trim().isLength({max:16}).withMessage("End Date must be less than 16 characters").escape(),
	body("description").trim().isLength({max:256}).withMessage("Description must be less than 128 characteres").escape(),
	(req,res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({message:"Invalid Validation", errors:errors.array()});
		}
		const newExperience = new workExp({
			positionName:req.body.positionName,
			companyName:req.body.companyName,
			startDate:req.body.startDate,
			endDate:req.body.endDate,
			description:req.body.description
		});
		newExperience.save();
		return res.status(201).json({message:"Successfully Created a new Work Experience"});
	}
];
exports.get_fe = (req,res,next) => {
	FeTech.find({})
	.then(result => 
		res.status(200).json({message:"Successful",FeTech:result})
	)
	.catch(err=> 
		res.status(400).json({message:"Unexpected Error"})
	);
};
exports.post_fe = [
	processImageMiddleware,
	(req,res,next) => {
		// checks if the file extension is valid image
		if (req.fileValidationError) {
    		return res.status(400).json({ error: req.fileValidationError });
    	}
		const storage = getStorage(); // reference to google cloud storage firebase bucket
		const imageRef = ref(storage, `feTech/${req.file.originalname}`); //referred to the location to which upload operator and download operator is used
		const metadata = {
		  contentType: req.file.mimetype
		};
		const firebaseImageOperator = new FirebaseImageOperator(imageRef,FeTech,req,res);
		FeTech.findOne({name:req.body.name})
			.then((result)=> {
				if (result === null) {
					firebaseImageOperator.upload(req.file.buffer,metadata);
				}
				else {
					return res.status(400).json({message:"The name already exist in the database"});
				}
			})
			.catch((err)=> {
				return res.status(400).json({error:err});
			});
	}
];
exports.get_be = (req,res,next) => {
	BeTech.find({})
	.then(result => 
		res.status(200).json({message:"Successful",BeTech:result})
	)
	.catch(err=> 
		res.status(400).json({message:"Unexpected Error"})
	);
};
exports.post_be = [
	processImageMiddleware,
	(req,res,next) => {
		// checks if the file extension is valid image
		if (req.fileValidationError) {
    		return res.status(400).json({ error: req.fileValidationError });
    	}
		const storage = getStorage(); // reference to google cloud storage firebase bucket
		const imageRef = ref(storage, `beTech/${req.file.originalname}`); //referred to the location to which upload operator and download operator is used
		const metadata = {
		  contentType: req.file.mimetype
		};
		const firebaseImageOperator = new FirebaseImageOperator(imageRef,BeTech,req,res);
		BeTech.findOne({name:req.body.name})
			.then((result)=> {
				if (result === null) {
					firebaseImageOperator.upload(req.file.buffer,metadata);
				}
				else {
					return res.status(400).json({message:"The name already exist in the database"});
				}
			})
			.catch((err)=> {
				return res.status(400).json({error:err});
			});
	}
];