require("dotenv").config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// PassportJS Setup

// Passport Strategy for Validating User Login Input
passport.use(new LocalStrategy((username,password,cb)=> {
	User.findOne({username:username}).then((user)=>{
		if (!user) {
			return cb(null,false,{message:"Incorrect Username"});
		}
		bcrypt.compare(password,user.password,(err,res) => {
			if (err) {
				return cb(err);
			}
			if (res) {
				return cb(null,user,{message:"Logged In Successfuly"});
			}
			else {
				return cb(null,false,{message:"Incorrect Password"});
			}
 		});
	}).catch((err)=> {
		return cb(err);
	});
}));

//JWTStrategy Option Configuration
const opts = {
	jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.SECRET_KEY
};

passport.use(new JWTStrategy(opts,(jwt_payload, cb) => {
	// Passes entire user to query
	return User.findOne(jwt_payload.user).exec((err,user)=> {
		if (err) {
			return cb(err);
		}
		return cb(null,user);
	});
}));