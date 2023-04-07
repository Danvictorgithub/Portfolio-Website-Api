require('dotenv').config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'MongoDB Connection Error'));