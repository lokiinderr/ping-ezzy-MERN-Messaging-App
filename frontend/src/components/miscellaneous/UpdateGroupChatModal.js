import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../userAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../userAvatar/UserListItem';

const UpdateGroupChatModal = ({fetchAgain, setFetchAgain, fetchMessages}) => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {user, selectedChat, setselectedChat} = ChatState();

    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const toast = useToast();
    
    const handleRemove = async(user1) =>{
        if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id){
            toast({
              title:"Only Admins Can Remove Someone To Group!",
            //   description: "Failed to Load the Chats",
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers:{
                    Authorization: `Bearer ${user.token}`
                }
            };

            const {data} = await axios.put("/api/chat/groupremove",
            {
                chatId:selectedChat._id,
                userId:user1._id,
            },
            config,
            )

            //user removing himself from the group
            user1._id===user._id ? setselectedChat() : setselectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);

        } catch (error) {
            toast({
              title:"Error Occured!",
              description: error.response.data.message,
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            setLoading(false);
        }

    }

    const handleAddUser = async(user1) => {
        if(selectedChat.users.find((u)=>u._id === user1._id)){
            toast({
              title:"User Already In Group!",
            //   description: "Failed to Load the Chats",
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            return;
        }

        //checking if the user is Admin or not
        if(selectedChat.groupAdmin._id !== user._id){
            toast({
              title:"Only Admins Can Add Someone To Group!",
            //   description: "Failed to Load the Chats",
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers:{
                    Authorization: `Bearer ${user.token}`
                }
            };

            const {data} = await axios.put("/api/chat/groupadd",
            {
                chatId:selectedChat._id,
                userId:user1._id,
            },
            config,
            )

            setselectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);

        } catch (error) {
            toast({
              title:"Error Occured!",
              description: error.response.data.message,
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            setLoading(false);
        }

    }
    
    const handleRename = async() =>{
        if(!groupChatName) return;

        try {
                setRenameLoading(true);

                const config = {
                headers:{
                Authorization:`Bearer ${user.token}`,
                },
            };

            const {data} = await axios.put('/api/chat/rename',{
                chatId:selectedChat._id,
                chatName:groupChatName
            },
            config
            );

            setselectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);

        } catch (error) {
            toast({
              title:"Error Occured!",
              description: error.response.data.message,
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            setRenameLoading(false);
        }
        setGroupChatName("")
    }

    const handleSearch = async(query) =>{
        setSearch(query);
        if(!query){
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers:{
                    Authorization: `Bearer ${user.token}`
                }
            }

            const {data} = await axios.get(`/api/user?search=${search}`,config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);

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


  return (
    <>
      <IconButton display={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}/>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px" fontFamily="Work sans"
            display={"flex"}
            justifyItems={"center"}
          >{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w={"100%"} display="flex" flexWrap={"wrap"} pb={3}>
                {selectedChat.users.map((u)=>(
                    <UserBadgeItem
                    key={user._id}
                    user={u}
                    handleFunction={()=> handleRemove(u)}
                />
                ))}
            </Box>
                    <FormControl display={"flex"}>
                        <Input
                            placeholder='Chat Name'
                            mb={3}
                            value={groupChatName}
                            onChange={(e)=>{setGroupChatName(e.target.value)}}
                        />
                        <Button
                            variant={"solid"}
                            colorScheme={"teal"}
                            ml={1}
                            isLoading={renameLoading}
                            onClick={handleRename}
                        >Update</Button>
                    </FormControl>

                    <FormControl>
                        <Input
                            placeholder='Add User To Group'
                            // mb={1}
                            onChange={(e)=>{handleSearch(e.target.value)}}
                        />
                    </FormControl>
                    {loading?(
                        <Spinner size={"lg"} ml="auto" display="flex"/>
                    ) : (
                        searchResult?.slice(0,4).map((user)=>(
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={()=>handleAddUser(user)}
                            />
                        ))
                    )}

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' onClick={()=> handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )

}

export default UpdateGroupChatModal