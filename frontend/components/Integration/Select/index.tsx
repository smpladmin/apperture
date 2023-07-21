//integration
import {
  Box,
  Flex,
  Heading,
  IconButton,
  RadioGroup,
  Stack,
  Text,
  Input,
  Image,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
// import { useEffect, useRef, useState } from 'react';
import { useState, useRef,useEffect } from 'react';
import { useRouter } from 'next/router';
import 'remixicon/fonts/remixicon.css';
import gaLogo from '@assets/images/ga-logo-small.svg';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';
import amplitudeLogo from '@assets/images/amplitude-icon.png';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import appertureLogo from '@assets/images/apperture-logo.svg';
import apilogo from '@assets/images/apilogo.png';
import mysqlLogo from '@assets/images/mysql-icon.png';
import FormButton from '@components/FormButton';
import IntegrationSource from '@components/IntegrationSource';
import { Provider } from '@lib/domain/provider';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import logo from '@assets/images/AppertureWhiteLogo.svg';
 import { CaretRight } from 'phosphor-react';

const SelectProvider = () => {
  const [provider, setProvider] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { appId, add, previousDsId } = router.query;

  const handleGoBack = (): void => router.back();

  const handleClose = () =>
    router.push({
      pathname: `/analytics/home/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });

  const handleNextClick = async () => {
    const queryParams = { appId, provider, ...router.query };

    if (provider === Provider.APPERTURE) {
      const integration = await createIntegrationWithDataSource(
        appId as string,
        provider,
        '',
        '',
        '',
        '',
        undefined,
        { params: { create_datasource: true, trigger_data_processor: false } }
      );
      router.push({
        pathname: '/analytics/app/[appId]/integration/[provider]/complete',
        query: {
          appId,
          provider,
          dsId: integration.datasource._id,
        },
      });
      return;
    }
    router.push({
      pathname: `/analytics/app/[appId]/integration/[provider]/create`,
      query: queryParams,
    });
  };

  const handleProviderChange = () => {

    if(provider){
    console.log('Provider has changed:', provider);
  }

    
  };

    useEffect(() => {
    handleProviderChange();
  }, [provider]);




  const datasources = [
    {
      id: 1,
      imageUrl: 'path_to_image_1',
      title: 'Title 1',
    },
    {
      id: 2,
      imageUrl: 'path_to_image_2',
      title: 'Title 2',
    },
    // Add more data objects as needed
  ];


  return (
    <Flex
      flexDirection="row"
      h="100vh" 
      bg="grey.900" 
      px={4}
    >

      <Box h="33%" bg="grey.900"> 
        
        <Box mt={11} width={{ base: 'full' }} maxW={{ md: '150', lg:'150'}}>
          
          
         <Box mt={11} ml={20}>
          <Image
            src={logo.src}
            color={'white'}
            width={30}
            cursor={'pointer'}
            onClick={() => {
              router.push({
                pathname: `/analytics/home/[dsId]`,
                query: { dsId },
              });
            }}
          ></Image> 

          <Heading
            as="h2"
            pb={{ base: 8, md: 10 }}
            fontSize={{ base: 'sh-56', md: 'sh-56' }}
            lineHeight={{ base: 'sh-28', md: 'sh-56' }}
            fontWeight="normal"
            color="white"
            mt={20}
          >
            Data analytics on steroids
          </Heading>
          

          <Flex flexDirection="row" alignItems="center" mt={20}>
              <IconButton
                aria-label="checkbox-circle-line"
                icon={<i className="ri-checkbox-circle-line" />}
                color="grey.700"
                bg="transparent"
                fontSize="sh-44"
                fontWeight="100"
                
              />
              <Text
                fontSize={{ base: 'sh-20', md: 'sh-20' }}
                lineHeight={{ base: 'sh-24', md: 'sh-24' }}
                fontWeight="normal"
                color="grey.700"
                ml={4}
              >
                Simply plug in your data connection and get started.
              </Text>
            </Flex>
            <Flex flexDirection="row" alignItems="center" mt={10}>
              <IconButton
                aria-label="checkbox-circle-line"
                icon={<i className="ri-checkbox-circle-line" />}
                color="grey.700"
                bg="transparent"
                fontSize="sh-44"
                fontWeight="100"
                
              />
              <Text
                fontSize={{ base: 'sh-20', md: 'sh-20' }}
                lineHeight={{ base: 'sh-24', md: 'sh-24' }}
                fontWeight="normal"
                color="grey.700"              
                ml={4}
              >
                Import sh*t ton of data.
              </Text>
            </Flex>
            <Flex flexDirection="row" alignItems="center" mt={10}>
              <IconButton
                aria-label="checkbox-circle-line"
                icon={<i className="ri-checkbox-circle-line" />}
                color="grey.700"
                bg="transparent"
                fontSize="sh-44"
                fontWeight="100"
                
              />
              <Text
                fontSize={{ base: 'sh-20', md: 'sh-20' }}
                lineHeight={{ base: 'sh-24', md: 'sh-24' }}
                fontWeight="normal"
                color="grey.700"
                ml={4}
              >
                Get access to a sheet interface that doesn’t crash
              </Text>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Remaining 2/3 of the screen */}
      <Flex
        flexDirection="column"
        bg="white" // Background color changed to white
        rounded="lg"
        p={6}
        mt={6}
        mb={6}
        flexGrow={1} // To occupy the remaining space
        alignItems="center"
      >
      <Flex justifyContent="space-between" alignItems="center" pb={4} >
        <IconButton
          aria-label="Go back"
          icon={<i className="ri-arrow-left-line" />}
          color="grey.700"
          bg="transparent"
          fontSize="sh-20"
          fontWeight="100"
          pr={12}
          _hover={{
            bg: 'white', // Change hover color to white
          }}
          onClick={handleGoBack}
        />
        
          <Flex flexDirection="column" pr={10} justifyContent="center" alignItems="center">
            <Flex flexDirection="row" justifyContent="center" alignItems="center"> 
              <i className="ri-checkbox-circle-fill" style={{ fontSize: '24px' }}></i>              
              <Text fontSize={"sh-18"} fontWeight="semibold" ml={2}>Sign up</Text>
            </Flex>
            <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
          </Flex>
          <Flex flexDirection="column" pr={10} pl={10} justifyContent="center" alignItems="center">
            <Flex flexDirection="row" justifyContent="center" alignItems="center"> 
              <i className="ri-checkbox-circle-fill" style={{ fontSize: '24px' }}></i>              
              <Text fontSize={"sh-18"} fontWeight="semibold" ml={2}>Set up Workspace</Text>
            </Flex>
            <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
          </Flex>
          <Flex flexDirection="column" pl={10} justifyContent="center" alignItems="center">
            <Text fontSize={"sh-18"} fontWeight="semibold" color="black">Add Datasource</Text>
            <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
          </Flex>
        
        <IconButton
          aria-label="Close"
          icon={<i className="ri-close-line" />}
          color="grey.700"
          bg="transparent"
          fontSize="sh-20"
          fontWeight="100"
          pl={12}
          _hover={{
            bg: 'white', 
          }}
          onClick={handleGoBack}
          
        />
      </Flex>
        <Box width={120} mt={20}>
        <Heading
          as="h3"
          fontSize="sh-36"
          fontWeight="bold"
          mb={6}
          textAlign="center"
        >
          Connect to a datasource
        </Heading>
         <Text fontSize={"sh-14"} textAlign="center" color="grey.500" fontWeight="normal">Choose from our list of connectors, or just upload a CSV file </Text>
        </Box>




        <Box
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius={'20'}
          rounded="md"
          p={4}
          display="flex"
          alignItems="center"
          mt={15}
    >
      <Box flex="1" minW="150">
        <Text fontSize="lg" fontWeight="semibold" color="gray.900">
          Upload a CSV
        </Text>
        <Text fontSize="md" color="gray.500" mt={2}>
          Select a file to upload
        </Text>
      </Box>
      <IconButton
          aria-label="Go back"
          icon={<CaretRight size={32} />}
          color="grey.900"
          fontSize="sh-20"
          fontWeight="100"
          bg="white"
          _hover={{
            bg: 'white', // Change hover color to white
          }}
        />
    </Box>


<Box width={'80%'} mb={'10'} mt="10" >
           <RadioGroup value={provider} onChange={setProvider}>
            <SimpleGrid columns={4} spacing={2}>
              <IntegrationSource sourceName="Connect an API" value={Provider.API} imgSrc={apilogo} selected={provider === Provider.API} />
              <IntegrationSource sourceName="Apperture" value={Provider.APPERTURE} imgSrc={appertureLogo} selected={provider === Provider.APPERTURE} />
              <IntegrationSource sourceName="MixPanel" value={Provider.MIXPANEL} imgSrc={mixpanelLogo} selected={provider === Provider.MIXPANEL} />
              <IntegrationSource sourceName="Amplitude" value={Provider.AMPLITUDE} imgSrc={amplitudeLogo} selected={provider === Provider.AMPLITUDE} />
              <IntegrationSource sourceName="Clevertap" value={Provider.CLEVERTAP} imgSrc={clevertapLogo} selected={provider === Provider.CLEVERTAP} />
              <IntegrationSource sourceName="Google Analytics" value={Provider.GOOGLE} imgSrc={gaLogo} selected={provider === Provider.GOOGLE} />
              <IntegrationSource sourceName="MySQL" value={Provider.MYSQL} imgSrc={mysqlLogo} selected={provider === Provider.MYSQL} />
            </SimpleGrid>
          </RadioGroup>
          </Box>


        <Button
          variant="primary"
          mt={6}
          rounded="lg"
          bg="white"
          p={6}
          fontSize="base"
          fontWeight="semibold"
          lineHeight="base"
          textColor="grey.900"
          textDecoration="underline"
          width={{ base: 'full', md: '72' }}
          _hover={{
            bg: 'white', // Change hover color to white
          }}
          // onClick={handleNextClick}
        >
          Explore a Sample Dataset
        </Button>


        <Button
          variant="primary"
          mt={6}
          rounded="lg"
          bg="black.100"
          p={6}
          fontSize="base"
          fontWeight="semibold"
          lineHeight="base"
          textColor="white.100"
          width={{ base: 'full', md: '72' }}
          disabled={!provider}
          onClick={handleNextClick}
        >
          Next
        </Button>




         <Box>
         </Box>
        
      </Flex>
    </Flex>





    // <Flex
    //   flexDirection={'column'}
    //   h={'full'}
    //   py={{ base: 4, md: 10 }}
    //   pl={{ base: 4, md: 45 }}
    //   pr={{ base: 4, md: 'auto' }}
    //   justifyContent={{ base: 'space-between', md: 'start' }}
    // >
    //   <Box>
    //     <IconButton
    //       aria-label="close"
    //       variant={'secondary'}
    //       icon={<i className="ri-close-fill" />}
    //       rounded={'full'}
    //       bg={'white.DEFAULT'}
    //       border={'1px'}
    //       borderColor={'white.200'}
    //       onClick={handleClose}
    //     />
    //     <Box width={{ base: 'full' }} maxWidth={{ md: '200' }} mt={11}>
    //       <Text
    //         textColor={'grey.200'}
    //         pb={6}
    //         fontSize={'xs-14'}
    //         lineHeight={'xs-14'}
    //         fontWeight={'medium'}
    //       >
    //         {add ? 'Step 1 of 2' : 'Step 2 of 3'}
    //       </Text>
    //       <Heading
    //         as={'h2'}
    //         pb={{ base: 8, md: 10 }}
    //         fontSize={{ base: 'sh-28', md: 'sh-56' }}
    //         lineHeight={{ base: 'sh-28', md: 'sh-56' }}
    //         fontWeight={'semibold'}
    //       >
    //         Select a data source
    //       </Heading>
    //       <Box width={'full'} marginBottom={'10'}>
    //         <RadioGroup value={provider} onChange={setProvider}>
    //           <Stack direction="column">
    //             <IntegrationSource
    //               sourceName="Connect an API"
    //               value={Provider.API}
    //               imgSrc={apilogo}
    //               selected={provider === Provider.API}
    //             />
    //             <IntegrationSource
    //               sourceName="Apperture"
    //               value={Provider.APPERTURE}
    //               imgSrc={appertureLogo}
    //               selected={provider === Provider.APPERTURE}
    //             />
    //             <IntegrationSource
    //               sourceName="MixPanel"
    //               value={Provider.MIXPANEL}
    //               imgSrc={mixpanelLogo}
    //               selected={provider === Provider.MIXPANEL}
    //             />
    //             <IntegrationSource
    //               sourceName="Amplitude"
    //               value={Provider.AMPLITUDE}
    //               imgSrc={amplitudeLogo}
    //               selected={provider === Provider.AMPLITUDE}
    //             />
    //             <IntegrationSource
    //               sourceName="Clevertap"
    //               value={Provider.CLEVERTAP}
    //               imgSrc={clevertapLogo}
    //               selected={provider === Provider.CLEVERTAP}
    //             />
    //             <IntegrationSource
    //               sourceName="Google Analytics"
    //               value={Provider.GOOGLE}
    //               imgSrc={gaLogo}
    //               selected={provider === Provider.GOOGLE}
    //             />
    //             <IntegrationSource
    //               sourceName="MySQL"
    //               value={Provider.MYSQL}
    //               imgSrc={mysqlLogo}
    //               selected={provider === Provider.MYSQL}
    //             />
    //           </Stack>
    //         </RadioGroup>
    //       </Box>
    //     </Box>
    //   </Box>
    //   <FormButton
    //     navigateBack={handleGoBack}
    //     handleNextClick={handleNextClick}
    //     disabled={!provider}
    //     nextButtonName={'Next'}
    //   />
    // </Flex>






  );
};

export default SelectProvider;
