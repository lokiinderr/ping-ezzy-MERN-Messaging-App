const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//creating or fetching a one on one chat
const accessChat=asyncHandler(async(req,res)=>{
    const {userId} = req.body;

    if(!userId){
        console.log("UserID Params not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users:{$elemMatch:{$eq:req.user._id}}}, //logged in user
            {users:{$elemMatch:{$eq:userId}}}, // user id we sent from the frontend
        ]
    }).populate("users","-password").populate("latestMessage");

    isChat = await User.populate(isChat,{
        path:'latestMessage.sender',
        select:"name pic email"
    });

    //checking if the chat already exists
    if(isChat.length>0){
        res.send(isChat[0]);
    }//if not we create a new chat
    else{
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users:[req.user._id,userId]
        };

        try {
            const createdChat = await Chat.create(chatData);

            const FullChat= await Chat.findOne({_id: createdChat._id}).populate(
                "users",
                "-password"
            );
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400)
            throw new Error(error.message);
        }
    }
})

//finding all the chats in which the logged in user is part, so we find the logged in users id inside all the users array
const fetchChat=asyncHandler(async(req,res)=>{
    try {
        Chat.find({
            users:{
                $elemMatch:{$eq:req.user._id}
            }
        })
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(results)=>{
            results = await User.populate(results,{
                path: "latestMessage.sender",
                select: "name pic email"
            });
            res.status(200).send(results);
        })
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const createGroupChat=asyncHandler(async(req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message: "Please Fill All The Fields"})
    }

    //we need to parse the array which is being sent from the frontend before we could use it
    var users = JSON.parse(req.body.users);
    if(users.length<2){
        return res.status(400)
                  .send("More Than 2 Users Are Required to Form a Group Chat");
    }
    //the user logged in must also be the part of the group chat
    users.push(req.user);
    try {
        //we create the chat, than fetch the chat and than send it to frontend
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin: req.user
        })

        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
            .populate("users","-password")
            .populate("groupAdmin","-password");

            res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})

const renameGroup=asyncHandler(async(req,res)=>{
    const {chatId, chatName} = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName:chatName,
        },
        {
            new:true,
        }
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

    if(!updatedChat){
        res.status(400);
        throw new Error("Chat Not Found");
    }
    else{
        res.json(updatedChat);
    }

})

const removeFromGroup=asyncHandler(async(req,res)=>{
    const {chatId, userId} = req.body;
    
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId}
        },
        {new:true}
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

    if(!removed){
        res.status(404);
        throw new Error("User Not Removed");
    }
    else{
        res.json(removed);
    }
})

const addToGroup=asyncHandler(async(req,res)=>{
    const {chatId, userId} = req.body;
    
    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId}
        },
        {new:true}
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

    if(!added){
        res.status(404);
        throw new Error("User Not Added");
    }
    else{
        res.json(added);
    }
})

module.exports = {accessChat,fetchChat,createGroupChat,renameGroup,removeFromGroup,addToGroup};