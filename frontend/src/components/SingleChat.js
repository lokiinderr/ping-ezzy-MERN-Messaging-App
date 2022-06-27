import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getSender, getSenderFull } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider'
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import "./style.css";
import io from "socket.io-client"


const ENDPOINT = "http://127.0.0.1:5000/" // or backend website when in development "http://127.0.0.1:5000/"
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    
    const {user, selectedChat, setselectedChat, notification, setNotification} = ChatState();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTypng, setIsTypng] = useState(false);

    const toast = useToast();


    const fetchMessages = async() => { 
        if(!selectedChat) return;

        try {
            const config = {
                    headers:{
                        Authorization:`Bearer ${user.token}`
                    }
                };

                setLoading(true);
                const {data} = await axios.get(`/api/message/${selectedChat._id}`,config);
                
                setMessages(data);
                setLoading(false);

                socket.emit("join chat", selectedChat._id);

        } catch (error) {
            toast({
              title:"Error Occured!",
              description: "Failed to Load the message!",
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
        }
    }

    const sendMessage = async(event) => {

        if(event.key==="Enter" && newMessage){
            socket.emit("stop typing",selectedChat._id);//removes the typing animation before 3 seconds if message is sent
            try {
                const config = {
                    headers:{
                        "Content-type":"application/json",
                        Authorization:`Bearer ${user.token}`
                    }
                };
                
                setNewMessage("");
                const {data} = await axios.post('/api/message',{
                    content: newMessage,
                    chatId: selectedChat._id,
                },
                config);

                //sending the message using socket.io
                socket.emit("new message",data)
                setMessages([...messages, data])

            } catch (error) {
              toast({
              title:"Error Occured!",
              description: "Failed to send message!",
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            }
        }
    }


    //establishing a socket io connection
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup",user);
        socket.on("connected",()=> setSocketConnected(true));
        socket.on("typing",()=> setIsTypng(true));
        socket.on("stop typing",()=> setIsTypng(false));

    }, [])

    useEffect(() => {
        fetchMessages();

        selectedChatCompare=selectedChat;
    }, [selectedChat])

    
    //receiving the sent message
    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved)=>{
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
                //give notification (this condition is if we have open someone else chat and we recieve a new message from other chat, we only give a notification and not append the message to currently opened chats chatbox)
                if(!notification.includes(newMessageRecieved)){

                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain) // this updates the chat list and brings the new chat to top
                }
            }
            else{
                setMessages([...messages, newMessageRecieved]);
            }
        })
    })
    
    
    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if(!socketConnected) return;
        if(!typing){
            setTyping(true);
            socket.emit("typing",selectedChat._id)
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow-lastTypingTime;

            if(timeDiff >= timerLength && typing){
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }

  return (
    <>
        {selectedChat ? (
            <>
                <Text
                    fontSize={{base:"28px", md:"30px"}} px={2} w={"100%"} pb={3} fontFamily="Work sans"
                    display={"flex"} justifyContent={{base:"space-between"}}
                    alignItems={"center"}
                >
                    <IconButton
                        display={{base:"flex", md:"none"}}
                        icon={<ArrowBackIcon/>}
                        onClick={()=>setselectedChat("")}
                    />

                    {!selectedChat.isGroupChat ? (
                        <>
                            {getSender(user,selectedChat.users)}
                            <ProfileModal user={getSenderFull(user,selectedChat.users)}/>
                        </>
                    ) : (
                        <>
                            {selectedChat.chatName.toUpperCase()}
                            <UpdateGroupChatModal
                                fetchMessages={fetchMessages}
                                fetchAgain={fetchAgain}
                                setFetchAgain={setFetchAgain}
                            />
                        </>
                    )}

                </Text>
                <Box
                    display={"flex"}
                    justifyContent="flex-end"
                    flexDir={"column"}
                    p={3}
                    bg="#E8E8E8"
                    w={"100%"}
                    h={"100%"}
                    borderRadius="lg"
                    overflowY={"hidden"}
                >
                    {
                        loading ? (<Spinner
                            size="xl"
                            w={20}
                            h={20}
                            alignSelf="center"
                            margin={"auto"}
                        />) : (
                            <div className='messages'>  
                                <ScrollableChat messages={messages}/>
                            </div>
                        )
                    }
                    <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                        {isTypng?<div>
                            Typing...
                        </div>:(<></>)}
                        <Input
                            variant={"filled"}
                            bg="#E0E0E0"
                            placeholder='Enter A Message...'
                            onChange={typingHandler}
                            value={newMessage}
                        />
                    </FormControl>
                </Box>
            </>
        ) : (
            <Box display={"flex"} alignItems="center" justifyContent={"center"} h="100%">
                <Text fontSize={"3xl"} pb={3} fontFamily="Work sans">
                    Click On An User To Start Chatting
                </Text>
            </Box>
        )}
    </>
  )
}

export default SingleChat