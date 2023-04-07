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
		const storage = getStorage();
		const imageRef = ref(storage, `feTech/${req.file.originalname}`);
		const metadata = {
		  contentType: req.file.mimetype
		};
		uploadBytes(imageRef,req.file.buffer,metadata).then((snapshot) => {
			console.log('Uploaded a blob or file!');
			getDownloadURL(imageRef).then((url)=>{
				console.log("url:",url);
			});
		}).catch((err) => {
			return res.setStatus(400).json({error:err});
		});
		return res.json({message:"File Uploaded Successfully"});
	}
];