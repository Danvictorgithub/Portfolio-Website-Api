const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user_controller.js");
router.get("/",(req,res)=> {
	res.json({message:"Deviate Personal Website API"});
});
router.post("/signup",user_controller.signup_POST);
router.post("/login",user_controller.login_POST);
module.exports = router;