const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const processImageMiddleware = require('../configs/multer-config.js');
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
		uploadBytes(imageRef,req.file.buffer,metadata).then(() => { //asynchronously uploads images
			console.log('Uploaded a blob or file!');
			getDownloadURL(imageRef).then((url)=>{ //gets the img URL
				console.log("url:",url);
			});
		}).catch((err) => {
			return res.setStatus(400).json({error:err});
		});
		return res.json({message:"File Uploaded Successfully"});
	}
];