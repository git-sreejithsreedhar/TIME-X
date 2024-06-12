const express = require('express');
const app = express();
const partials = require('partials');
require('dotenv').config()
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport')



const {v4:uuidv4}= require ('uuid');
const PORT = process.env.PORT


const db = mongoose.connect(process.env.DB_URI)
db.then(()=>{
  console.log("Database connected");
})
.catch(()=>{
  console.log("Error in connecting to database");
})




app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');


app.use("/static",express.static(path.join(__dirname,'public')));


app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true
  }));
    

app.use('/', require('./routes/adminRoutes'))
app.use('/', require('./routes/userRoutes'))


  app.listen(PORT,()=>{
    console.log("Listening to server http://localhost:3000");
  })