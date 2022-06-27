import React, { useEffect } from 'react'
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useHistory } from 'react-router-dom';

    
const HomePage = () => {
    const history = useHistory();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if(user){
            history.push("/chats");
        }
    }, [history])
  
  return (
    //we use Container from Chakra UI, it helps is keeping the Div responsive
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={1}
        bg={"white"}
        w="100%"
        m="25px 0 15px 0"
        borderRadius="lg"
        borderWidth={"1px"}
        textAlign="center"
      >
        <Text fontSize={"4xl"} fontFamily="Work sans" color={"black"}>Talk-A-Tive</Text>
      </Box>
      <Box
        p={1}
        bg={"white"}
        w="100%"
        borderRadius="lg"
        borderWidth={"1px"} 
      >
          <Tabs isFitted variant='soft-rounded'>
            <TabList m='0.5em 0.5em 0.2em 0.5em'>
              <Tab>Login</Tab>
              <Tab>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login/>
              </TabPanel>
              <TabPanel>
                <Signup/>
              </TabPanel>
            </TabPanels>
          </Tabs>

      </Box>
    </Container>
  )
}

export default HomePage