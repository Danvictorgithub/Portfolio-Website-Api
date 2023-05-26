const express = require("express");
const router = express.Router();
const passport = require("passport");
const user_controller = require("../controllers/user_controller.js");
router.get("/",(req,res)=> {
	res.json({message:"Deviate Personal Website API"});
});
router.post("/signup",user_controller.signup_POST);
router.post("/login",user_controller.login_POST);
router.get("/workExp",user_controller.get_we);
router.post("/workExp/upload",user_controller.post_we);
router.get("/feTech",user_controller.get_fe);
router.post("/feTech/upload",passport.authenticate('jwt',{session:false}),user_controller.post_fe);
router.get("/beTech",user_controller.get_be);
router.post("/beTech/upload",passport.authenticate('jwt',{session:false}),user_controller.post_be);
router.get("/persProj",user_controller.get_pp);
router.post("/persProj/upload",passport.authenticate('jwt',{session:false}),user_controller.post_pp);
router.all("*",(req,res)=> {
	res.status(400).json({message:"Invalid API Request"});
});

module.exports = router;