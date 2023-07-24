import {
  Box,
  chakra,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from '@chakra-ui/react';
import amplitudeLogo from '@assets/images/amplitude-icon.svg';
import Image from 'next/image';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import { CaretRight, CheckCircle} from 'phosphor-react';
import onboarding_left_panel from '@assets/images/onboarding_left_panel.svg';


export const containerStyle = {
    display: 'flex',
    height: '100vh', // Set the height of the page to the full viewport height
  };

  export const leftContainerStyle = {
    flex: '0 0 25%', 
    backgroundImage: onboarding_left_panel.src,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  export const rightContainerOuter = {
    flex: '0 0 75%', // The second container takes 75% of the available width
    backgroundColor: 'grey.900', // Optional: Adding a background color to the second container
    display: 'flex',
    justifyContent: 'center', // Optional: Centering content horizontally in the second container
    alignItems: 'center', // Optional: Centering content vertically in the second container
    paddingRight: '5',
    paddingTop: '5',
    paddingBottom: '5',
  };

  export const rightContainerInner = {
    backgroundColor: 'white', // Optional: Adding a background color to the second container
    width: '100%',
    height: '100%',
    borderRadius: '10px',
    overflow: 'auto',
  };

export const LeftContainerContent = () => {
  return(
        <Flex flexDirection="column" alignItems="left" justifyContent="start">
          <Box mt={5} ml={5} >
            <Image
              src={logo.src}
              color={'white'}
              width={100}
              height={32}
              cursor={'pointer'}
              onClick={() => {
                router.push({
                  pathname: `/analytics/home/[dsId]`,
                  query: { dsId },
                });
              }}
            ></Image>
          </Box>
          <Heading
            as="h2"
            pb={{ base: 8, md: 10 }}
            fontSize={{ base: 'sh-44', md: 'sh-44' }}
            lineHeight={{ base: 'sh-24', md: 'sh-44' }}
            fontWeight="normal"
            color="white"
            mt={20}
            ml={5}
          > Data analytics on steroids
          </Heading>
            <Flex flexDirection="row" alignItems="center" mt={10} ml={5} mr={5}>
              <CheckCircle size={28} color="white" />
                <Text
                  fontSize={{ base: 'sh-14', md: 'sh-14' }}
                  lineHeight={{ base: 'sh-18', md: 'sh-18' }}
                  fontWeight="normal"
                  color="grey.700"
                  ml={4}
                >
                  Simply plug in your data connection and get started.
                </Text>
            </Flex>
            <Flex flexDirection="row" alignItems="center" mt={5} ml={5} mr={5}>
              <CheckCircle size={28} color="white" />
                <Text
                  fontSize={{ base: 'sh-14', md: 'sh-14' }}
                  lineHeight={{ base: 'sh-18', md: 'sh-18' }}
                  fontWeight="normal"
                  color="grey.700"
                  ml={4}
                >
                  Import GBs of data and see blazing fast performance.
                </Text>
            </Flex>
            <Flex flexDirection="row" alignItems="center" mt={5} ml={5} mr={5}>
              <CheckCircle size={28} color="white" />
                <Text
                  fontSize={{ base: 'sh-14', md: 'sh-14' }}
                  lineHeight={{ base: 'sh-18', md: 'sh-18' }}
                  fontWeight="normal"
                  color="grey.700"
                  ml={4}
                >
                  Get access to a sheet interface that doesn’t crash
                </Text>
            </Flex>
        </Flex>
    );
}


export const TopProgress = (props) => {

  const handleGoBack = () => {
      if (props.handleGoBack) {
        props.handleGoBack();
      }
    };
  return(
                  <Flex justifyContent="space-between" alignItems="center" pb={4} mt={5}>
                      <IconButton  aria-label="Go back" icon={<i className="ri-arrow-left-line" />}
                        color="grey.700" bg="transparent" fontSize="sh-20" fontWeight="100" pr={12}
                        _hover={{
                          bg: 'white', // Change hover color to white
                        }}
                        onClick={handleGoBack}
                      />
                      
                        <Flex flexDirection="column" pr={10} justifyContent="center" alignItems="center">
                          <Flex flexDirection="row" justifyContent="center" alignItems="center"> 
                            <i className="ri-checkbox-circle-fill"  fontSize= 'xs-10'></i>              
                            <Text fontSize={"xs-12"} fontWeight={500} ml={2} color="grey.900">Sign up</Text>
                          </Flex>
                          <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
                        </Flex>
                        <Flex flexDirection="column" pr={10} pl={10} justifyContent="center" alignItems="center">
                          <Flex flexDirection="row" justifyContent="center" alignItems="center"> 
                            <i className="ri-checkbox-circle-fill" fontSize= 'xs-10'></i>              
                            <Text fontSize={"xs-12"} fontWeight={500} ml={2} color="grey.900">Set up Workspace</Text>
                          </Flex>
                          <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
                        </Flex>
                        <Flex flexDirection="column" pl={10} justifyContent="center" alignItems="center">
                          <Text fontSize={"xs-12"} fontWeight={500} color="grey.900">Add Datasource</Text>
                          <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
                        </Flex>
                      

                    </Flex>
    );
}




