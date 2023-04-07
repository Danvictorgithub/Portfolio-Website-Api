const { 
	getStorage, 
	ref, 
	uploadBytes, 
	getDownloadURL
} = require("firebase/storage");
const frontEndTech = require('../models/frontEndTechnologies.js'); 
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