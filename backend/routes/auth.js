const express = require("express");
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken')
var fetchuser = require('../middleware/fetchuser')



const jwt_secret = 'kartikisagoodb$oy'


//Route 1
//create a user using: POST "api/auth/createUser". doesnt require auth

router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password', 'password must be atlest 5 char').isLength({min:5})
] ,async (req,res)=>{
    //if there are errors, return bad request and the errors
   const errors = validationResult(req);
   if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
   }
   //check whetere the user with the same email exist
   try{
   let user = await User.findOne({email: req.body.email});
   if(user){
    return res.status(400).json({
        error: "Email address already registered. Use different Email"
    })
   }
   const salt = await bcrypt.genSalt(10);
   secPass = await bcrypt.hash(req.body.password, salt) ;

   //create user
   user = await User.create({
    name:req.body.name,
    password:secPass,
    email:req.body.email,
   })

   const data = {
    user:{
        id:user.id
    }
   }

   const authToken = jwt.sign(data, jwt_secret);
   res.json({authToken})


res.json(user)
} catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error")
}

})
//Route2
//authenticarte a user: post "/api/auth/signin"  -> no login require

router.post('/signin', [
    body('email', "Enter a valid email").isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Please try to enter with corrrect credentials"});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please try to enter with corrrect credentials"});
        }

        const data = {
            user:{
                id:user.id
            }
        }

        const authToken = jwt.sign(data,jwt_secret);
        res.json({authToken})
    } catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})


//route3 get loggedin User Detail using: post "/api/auth/getuser"  -->login require
router.post('/getuser',fetchuser, async (req,res)=>{
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})





module.exports = router;