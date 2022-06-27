import { Box, Button, FormControl, Input, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../userAvatar/UserListItem';
import UserBadgeItem from '../userAvatar/UserBadgeItem';

const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState([]);

    const {user, chats, setChats} = ChatState();

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

    const handleSubmit = async() =>{
        if(!groupChatName || !selectedUser){
            toast({
              title:"Please Fill All The Fields",
              status:"warning",
              duration:3000,
              isClosable:true,
              position:"top"
            });
            return;
        }

        try {
            const config = {
                headers:{
                    Authorization: `Bearer ${user.token}`
                }
            };

            const {data} = await axios.post("/api/chat/group",
            {
                name:groupChatName,
                users:JSON.stringify(selectedUser.map((u)=> u._id))
            },
            config
            )

            setChats([data,...chats]);
            onClose();
            toast({
              title:"New Group Chat Created!",
              status:"success",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
            setSelectedUser([]);

        } catch (error) {
            toast({
              title:"Failed to Create the Group Chat!",
              description: error.response.data,
              status:"error",
              duration:3000,
              isClosable:true,
              position:"bottom"
            });
        }

    }

    const handleDelete = (delUser) =>{
        setSelectedUser(selectedUser.filter((sel) => sel._id !== delUser._id))
    }

    const handleGroup = (userToAdd) =>{
        if(selectedUser.includes(userToAdd)){
            toast({
              title:"User Already Added",
              status:"warning",
              duration:3000,
              isClosable:true,
              position:"top"
            });
            return;
        }

        setSelectedUser([...selectedUser, userToAdd])
        setSearch("");
    }

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontFamily="Work sans"
            fontSize="35px"
            display={"flex"}
            justifyContent="center"
          >
          Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDir="column"
            alignItems={"center"}
          >
            <FormControl>
                <Input 
                    placeholder='Chat Name'
                    mb={3}
                    onChange={(e)=>setGroupChatName(e.target.value)}
                />
            </FormControl>
            <FormControl>
                <Input 
                    placeholder='Add Users'
                    mb={1}
                    onChange={(e)=>handleSearch(e.target.value)}
                />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
            {selectedUser.map(u=>(
                <UserBadgeItem
                    key={user._id}
                    user={u}
                    handleFunction={()=> handleDelete(u)}
                />
            ))}
            </Box>

            {loading?<Spinner ml="auto" display="flex"/> : (
                searchResult?.slice(0,4).map(user => (
                    <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={()=>handleGroup(user)}
                    />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModal