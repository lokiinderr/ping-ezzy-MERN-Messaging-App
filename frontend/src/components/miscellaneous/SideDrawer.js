import React, { useState } from 'react'
import {Box, Text} from '@chakra-ui/layout'
import {Avatar, Button, Drawer, DrawerBody, DrawerContent,
  DrawerHeader, DrawerOverlay, Input, Menu, MenuButton,
  MenuDivider, MenuItem, MenuList, Spinner, 
  Tooltip, useDisclosure, useToast} from '@chakra-ui/react'
import {BellIcon, ChevronDownIcon, StarIcon} from '@chakra-ui/icons'
import { ChatState } from "../../Context/ChatProvider" 
import ProfileModal from './ProfileModal'
import { useHistory } from 'react-router-dom'
import axios from 'axios';
import ChatLoading from '../ChatLoading'
import UserListItem from '../userAvatar/UserListItem'
import { getSender } from '../../config/ChatLogics'

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {user, setselectedChat, chats, setChats, notification, setNotification} = ChatState();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  }

  const handleSearch = async () => {
    if(!search){
      toast({
              title:"Please Enter Something In Search",
              status:"warning",
              duration:3000,
              isClosable:true,
              position:"top-left"
            });
            return ;
    }
    try {
      setLoading(true);

      const config = {
        headers:{
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data}=await axios.get(`/api/user?search=${search}`,config);
      setLoading(false);
      setSearchResult(data);
      setSearch("");
    } catch (error) {
        toast({
              title:"Error Occured!",
              description: "Failed to Load the Search Result",
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom-left"
            });
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      
      const config = {
        headers:{
          "Content-type":"application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data} = await axios.post("/api/chat",{userId},config);

      //if chat already exsits
      if(!chats.find((c)=> c._id===data._id)){
        setChats([data, ...chats]);
      }

      setselectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
        toast({
              title:"Error Fetching the Chat!",
              description: error.message,
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom-left"
            });
    }
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItem="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip 
          label='Search User To Chat'
          hasArrow
          placement="bottom-end"
        >
        <Button variant='ghost' onClick={onOpen}>
          <i class="fas fa-search"></i>
          <Text display={{base:"none", md:"flex"}} px="4">
            Search User
          </Text>
        </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans" paddingTop='2px'>Talk-A-Tive</Text>
        <div>
          <Menu>
            <MenuButton p={1}>{notification.length?<StarIcon fontSize={"2xl"} m={1}/>:<BellIcon fontSize={"2xl"} m={1}/>}
              {/* <BellIcon fontSize={"2xl"} m={1}/>
              <ChatIcon fontSize={"xl"} m={1}/> */}
            </MenuButton>
            <MenuList p={2} >
              {!notification.length && "No New Messages!"}
              {notification.map(notif => (
                <MenuItem key={notif._id} onClick={()=>{
                  //opening the chat which received the new message
                  setselectedChat(notif.chat)
                  //removing the notification from notification array
                  setNotification(notification.filter((n)=> n !== notif)); 
                }}>
                    {notif.chat.isGroupChat ? `New Message In Group: ${notif.chat.chatName}`
                    : 
                    `New Message From ${getSender(user,notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon/>}
            >
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
              <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider/>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
        <DrawerBody>
            <Box display="flex" pb={2}>
                <Input 
                  placeholder='Search By Name or Email' 
                  mr={2}
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                />
                <Button 
                  onClick={handleSearch}
                >Go</Button>
            </Box>
            {loading?(
              <ChatLoading/>
            ) : (
              searchResult?.map(user=>(
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={()=>accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex"/>}
        </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer