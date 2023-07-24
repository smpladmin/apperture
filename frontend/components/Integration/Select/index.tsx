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
 import { FileArrowUp, CaretRight } from 'phosphor-react';
import onboarding_left_panel from '@assets/images/onboarding_left_panel.svg';
import {containerStyle, leftContainerStyle, rightContainerOuter, LeftContainerContent, rightContainerInner, TopProgress} from '@components/onboarding';


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
    <Box sx={containerStyle}>
      <Box sx={leftContainerStyle}>
        <LeftContainerContent/>
      </Box>

      <Box sx={rightContainerOuter}>
        <Box sx={rightContainerInner}>
          <Flex
            flexDirection="column"
            alignItems="center"
          >
            <TopProgress handleGoBack={handleGoBack}/>
      
            <Box width={120} mt={10}>
              <Heading
                as="h3"
                fontSize="sh-24"
                fontWeight="bold"
                mb={3}
                textAlign="center"
              >
                Connect to a datasource
              </Heading>
             <Text fontSize={"xs-12"} textAlign="center" color="grey.500" fontWeight="normal">Choose from our list of connectors, or just upload a CSV file </Text>
            </Box>

        <Box
          borderWidth="1px"
          borderColor="gray.300"
          borderRadius={'20'}
          rounded="md"
          p={4}
          display="flex"
          alignItems="center"
          mt={10}
    >
    <FileArrowUp size={30} color="#212121" />
      <Box flex="1" minW="150" pl={2}>
        <Text fontSize="xs-14" fontWeight="semibold" color="gray.900">
          Upload a CSV
        </Text>
        <Text fontSize="xs-10" color="gray.500" >
          Select a file to upload
        </Text>
      </Box>
      <IconButton
          aria-label="Go back"
          icon={<CaretRight size={14} />}
          color="grey.900"
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
              <IntegrationSource sourceName="Apperture" value={Provider.APPERTURE} imgSrc={appertureLogo} selected={provider === Provider.APPERTURE} />
              <IntegrationSource sourceName="MySQL" value={Provider.MYSQL} imgSrc={mysqlLogo} selected={provider === Provider.MYSQL} />
              <IntegrationSource sourceName="MixPanel" value={Provider.MIXPANEL} imgSrc={mixpanelLogo} selected={provider === Provider.MIXPANEL} />
              <IntegrationSource sourceName="Amplitude" value={Provider.AMPLITUDE} imgSrc={amplitudeLogo} selected={provider === Provider.AMPLITUDE} />
              <IntegrationSource sourceName="Clevertap" value={Provider.CLEVERTAP} imgSrc={clevertapLogo} selected={provider === Provider.CLEVERTAP} />
              <IntegrationSource sourceName="Google Analytics" value={Provider.GOOGLE} imgSrc={gaLogo} selected={provider === Provider.GOOGLE} />
              <IntegrationSource sourceName="Connect an API" value={Provider.API} imgSrc={apilogo} selected={provider === Provider.API} />
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
          mb={1}
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


      </Flex>
    </Box>
    </Box>
    </Box>





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
