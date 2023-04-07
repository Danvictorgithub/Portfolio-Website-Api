var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/user_controller.js');
/* GET users listing. */
router.get('/user', function(req, res, next) {
  res.json({message:"message received"}); 
});
router.post('/upload',user_controller.post_fe);
module.exports = router;
