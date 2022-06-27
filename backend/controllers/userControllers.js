const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");


const allUsers = asyncHandler(async(req,res)=>{
    //in browser if url/api/user?search=xyz;
    //this keyword now contains the value xyz
    const keyword = req.query.search 
    ? 
    {
        $or:[
            {name: {$regex: req.query.search, $options: "i"}}, //the i here is for case insensitive
            {email: {$regex: req.query.search, $options: "i"}},
        ],
     } 
    : {};

    //gives list of all users execept the one logged in, we used ne=not equal to query here
    //since this uses req.user._id it needs to get passed from the authrization middleware first
    const users = await User.find(keyword).find({_id: {$ne: req.user._id}});
    res.send(users);
    
});

const registerUser = asyncHandler(async (req,res) => {
    const {name, email, password, pic} = req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter All The Fields");
    }

    const userExists=await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User Already Exists");
    }

    const user=await User.create({
        name,
        email,
        password,
        pic
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }else{
        res.status(400);
        throw new Error("Failed to Create the User")
    }
});

const authUser = asyncHandler(async(req,res)=>{
    const {email, password} = req.body;

    const user=await User.findOne({email});

    //decrpyting the hashed password, this matched password fuction is present inside our usermodel
    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id),
        })
    }else{
        res.status(401);
        throw new Error("Bad User Credentials")
    }
});


module.exports={registerUser, authUser, allUsers};