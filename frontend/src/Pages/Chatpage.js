import React, { useState } from 'react';
import { ChatState } from "../Context/ChatProvider"
import {Box} from '@chakra-ui/layout'
import SideDrawer from '../components/miscellaneous/SideDrawer'
import MyChats from '../components/MyChats'
import Chatbox from '../components/Chatbox'

const ChatPage = () => {
  const { user }= ChatState();    
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{width:"100%"}}>
    {user && <SideDrawer/>}
      <Box 
        display="flex"
        justifyContent='space-between'
        w='100%'
        h='90vh'
        p='10px'
      >
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
        {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  )
}

export default ChatPage