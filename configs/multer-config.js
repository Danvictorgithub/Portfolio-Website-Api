// File Upload API configuration with Multer
const multer = require('multer');
const imageFilter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      req.fileValidationError = "Forbidden extension";
      cb(null,false,req.fileValidationError);
    }
  };
// Filters to Image Only
module.exports = multer({storage:multer.memoryStorage(),fileFilter:imageFilter, limits: { fileSize: 2000000 }}).single('img'); // limit imgage upload to 2MB

