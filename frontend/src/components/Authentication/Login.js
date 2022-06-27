import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';


const Login = () => {
    const [email, setemail] = useState();
    const [password, setpassword] = useState();
    const [show, setshow] = useState(false);
    const [loading, setloading] = useState(false);

    const toast = useToast();
    const history=useHistory();

    const submitHandler = async()=>{
        setloading(true);
        
        if(!email || !password){
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


        ///submtting our data from frontend to DB, we set headers as we send JSON data
        try {
            const config={
                headers:{
                    "Content-type":"application/json",
                },
            };
            const {data}=await axios.post("/api/user/login",
                {email,password},
                config
            );

            toast({
                title:"Login Successful",
                status:"success",
                duration:3000,
                isClosable:true,
                position:"bottom"
            });
            localStorage.setItem('userInfo',JSON.stringify(data));
            setloading(false);

            history.push('/chats');
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

        <FormControl id='email' isRequired>
            <FormLabel>Email</FormLabel>
            <Input
                type={"email"}
                value={email}
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
                    value={password}
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

        <Button
            width={"100%"}
            colorScheme="twitter"
            style={{marginTop:20}}
            onClick={submitHandler}
            isLoading={loading}
        >
            Login
        </Button>

        <Button
            variant={'solid'}
            width={"100%"}
            style={{marginTop:10}}
            colorScheme="red"
            onClick={()=>{
                setemail('guest@test.com')
                setpassword('guest')
            }
            }
        >
            Guest Login
        </Button>
    </VStack>
  )
}

export default Login