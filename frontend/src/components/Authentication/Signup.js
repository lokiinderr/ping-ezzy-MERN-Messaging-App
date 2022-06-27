import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Signup = () => {
    const [name, setname] = useState();
    const [email, setemail] = useState();
    const [password, setpassword] = useState();
    const [confirmPass, setconfirmPass] = useState();
    const [pic, setpic] = useState();
    const [show, setshow] = useState(false);
    const [loading, setloading] = useState(false);

    const history=useHistory();
    const toast = useToast();

    const postDetails = (pics)=>{
        setloading(true);
        if(pics===undefined){
            toast({
                title:"Please Select an Image",
                status:"error",
                duration:3000,
                isClosable:true,
                position:"bottom"
            })
            return;
        }

        if(pics.type==="image/jpeg" || pics.type==="image/png" || pics.type==="image/jpg"){
            const data=new FormData();
            data.append("file",pics);
            data.append("upload_preset","socialnetworking");
            data.append("cloud_name","lokindercloud")
            fetch('https://api.cloudinary.com/v1_1/lokindercloud/image/upload',{
                method:"post",
                body:data
            }).then((res)=>res.json())
            .then((data)=>{
                setpic(data.url.toString());
                setloading(false);
            }).catch(err=>{
                console.log(err);
                setloading(false);
            })
        }else{
            toast({
                title:"Please Select an Valid Image Format (.jpg/.png)",
                status:"warning",
                duration:3000,
                isClosable:true,
                position:"bottom"
            });
            setloading(false);
            return;
        }
    };
    const submitHandler = async()=>{
        setloading(true);
        
        if(!name || !email || !password || !confirmPass){
            toast({
                title:"Please Fill All The Fields",
                status:"warning",
                duration:3000,
                isClosable:true,
                position:"bottom"
            });
            setloading(false);
            return;
        }

        if(password!==confirmPass){
            toast({
                title:"Passwords Do Not Match",
                status:"warning",
                duration:3000,
                isClosable:true,
                position:"bottom"
            });
            setloading(false);
            return;
        }

        ///submtting our data from frontend to DB, we set headers as we send JSON data
        try {
            const config={
                headers:{
                    "Content-type":"application/json",
                },
            };
            const {data}=await axios.post("/api/user",
                {name,email,password,pic},
                config
            );

            toast({
                title:"Registration Successful",
                status:"success",
                duration:3000,
                isClosable:true,
                position:"bottom"
            });
            localStorage.setItem('userInfo',JSON.stringify(data));
            setloading(false);
            
            history.push('/chats')
            window.location.reload();
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:error.response.data.message,
                status:"error",
                duration:3000,
                isClosable:true,
                position:"bottom"
            });
            setloading(false);
        }

    };

  return (
    <VStack spacing={'3px'}>
        <FormControl id='first-name' isRequired>
            <FormLabel>Name</FormLabel>
            <Input
                placeholder='Enter Your Name'
                onChange={(e)=>{
                    setname(e.target.value)
                }}
            />
        </FormControl>

        <FormControl id='email' isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
                type={"email"}
                placeholder='Enter Your Email'
                onChange={(e)=>{
                    setemail(e.target.value)
                }}
            />
        </FormControl>
        
        <FormControl id='password' isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
                <Input
                    type={show?"text":"password"}
                    placeholder='Enter Your Password'
                    onChange={(e)=>{
                        setpassword(e.target.value)
                    }}
                />
                <InputRightElement width={"4.5rem"}>
                    <Button h="1.75rem" size={"sm"}
                        onClick={()=>{
                            setshow(!show)
                        }}
                    >
                    {!show?"Show":"Hide"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <FormControl id='password' isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
                <Input
                    type={show?"text":"password"}
                    placeholder='Confirm Password'
                    onChange={(e)=>{
                        setconfirmPass(e.target.value)
                    }}
                />
                <InputRightElement width={"4.5rem"}>
                    <Button h="1.75rem" size={"sm"}
                        onClick={()=>{
                            setshow(!show)
                        }}
                    >
                    {!show?"Show":"Hide"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <FormControl id='pic'>
            <FormLabel>Upload Your Picture</FormLabel>
            <Input
                type={"file"}
                p={1.5}
                accept="image/*"
                onChange={(e)=>{
                    postDetails(e.target.files[0])
                }}
            />
        </FormControl>

        <Button
            width={"100%"}
            colorScheme="twitter"
            style={{marginTop:20}}
            onClick={submitHandler}
            isLoading={loading}
        >
            Sign Up
        </Button>

    </VStack>
  )
}

export default Signup