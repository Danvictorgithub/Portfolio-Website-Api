const express = require("express");
const router = express.Router();
const passport = require("passport");
const user_controller = require("../controllers/user_controller.js");
router.get("/",(req,res)=> {
	res.json({message:"Deviate Personal Website API"});
});
router.post("/signup",user_controller.signup_POST);
router.post("/login",user_controller.login_POST);
router.post("/upload/feTech",passport.authenticate('jwt',{session:false}),user_controller.post_fe);
router.all("*",(req,res)=> {
	res.status(400).json({message:"Invalid API Request"});
});

module.exports = router;