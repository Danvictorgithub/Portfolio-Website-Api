const { 
	getStorage, 
	ref, 
	uploadBytes, 
	getDownloadURL
} = require("firebase/storage");
const passport = require("passport");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const {body,validationResult} = require("express-validator");
const frontEndTech = require('../models/frontEndTechnologies.js'); 
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
					const newfrontEndTech = new this.model({
						name:this.req.body.name,
						imgLocation:url
					});
					newfrontEndTech
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

exports.get_fe = (req,res,next) => {
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
		const firebaseImageOperator = new FirebaseImageOperator(imageRef,frontEndTech,req,res);
		frontEndTech.findOne({name:req.body.name})
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