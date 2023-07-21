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
 import { CaretRight } from 'phosphor-react';

type AmplitudeIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
};
const AmplitudeIntegration = ({
  add,
  handleClose,
}: AmplitudeIntegrationProps) => {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [validData, setValidData] = useState(false);
  
  const handleGoBack = (): void => router.back();

  useEffect(() => {
    setValidData(!!(projectId && apiKey && apiSecret));
  }, [projectId, apiKey, apiSecret]);

  const onSubmit = async () => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;

    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      projectId,
      apiKey,
      apiSecret,
      ''
    );
    router.replace({
      pathname: '/analytics/app/[appId]/integration/[provider]/complete',
      query: {
        appId: router.query.appId,
        provider: router.query.provider,
        dsId: integration.datasource._id,
      },
    });
  };

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
            width={120}
            height={32}
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
        
  
      </Flex>
        


        <Flex
      direction={'column'}
      py={{ base: 4, md: 10 }}
      pl={{ base: 4, md: 45 }}
      pr={{ base: 4, md: 'auto' }}
      h={'full'}
      justifyContent={{ base: 'space-between', md: 'start' }}
    >
      <Box>
        
        <Box height={{ base: 12, md: 18 }} width={{ base: 12, md: 18 }} mb={2}>
          <Image src={amplitudeLogo} alt="amplitude" layout="responsive" />
        </Box>
       
        <Heading
          as={'h3'}
          mb={{ base: 8, md: 10 }}
          fontSize={{ base: 'sh-36', md: 'sh-44' }}
          lineHeight={{ base: '2.125rem', md: '4.125rem' }}
          fontWeight={'semibold'}
          maxW={200}
        >
          Enter Details to fetch data from Amplitude
        </Heading>
        <Box>
          <Box mb={5}>
            <Text
              as="label"
              color="grey.100"
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              display="block"
              htmlFor="projectId"
            >
              Project ID
            </Text>
            <Input
              id="projectId"
              size={'lg'}
              width={{ base: 'full', md: 125 }}
              bg={'white.100'}
              rounded={'0.25rem'}
              fontSize={'base'}
              lineHeight={'base'}
              textColor={'black.400'}
              placeholder="Enter 7 Digit Project ID"
              py={4}
              px={3.5}
              focusBorderColor={'black.100'}
              border={'0.6px'}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              _placeholder={{
                fontSize: '1rem',
                lineHeight: '1.375rem',
                fontWeight: 400,
                color: 'grey.100',
              }}
            />
          </Box>
          <Box mb={5}>
            <Text
              as="label"
              color="grey.100"
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              display="block"
              htmlFor="apiKey"
            >
              API Key
            </Text>
            <Input
              id="apiKey"
              size={'lg'}
              width={{ base: 'full', md: 125 }}
              bg={'white.100'}
              rounded={'0.25rem'}
              fontSize={'base'}
              lineHeight={'base'}
              textColor={'black.400'}
              placeholder="Enter 6 Digit API Key"
              py={4}
              px={3.5}
              focusBorderColor={'black.100'}
              border={'0.6px'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              _placeholder={{
                fontSize: '1rem',
                lineHeight: '1.375rem',
                fontWeight: 400,
                color: 'grey.100',
              }}
            />
          </Box>
          <Box mb={10}>
            <Text
              as="label"
              color="grey.100"
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              display="block"
              htmlFor="apiSecret"
            >
              API Secret
            </Text>
            <Input
              id="apiSecret"
              size={'lg'}
              width={{ base: 'full', md: 125 }}
              bg={'white.100'}
              rounded={'0.25rem'}
              fontSize={'base'}
              lineHeight={'base'}
              textColor={'black.400'}
              placeholder="Enter API Secret"
              py={4}
              px={3.5}
              focusBorderColor={'black.100'}
              border={'0.6px'}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              _placeholder={{
                fontSize: '1rem',
                lineHeight: '1.375rem',
                fontWeight: 400,
                color: 'grey.100',
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box mb={5}>
        <FormButton
          navigateBack={() => router.back()}
          handleNextClick={() => onSubmit()}
          disabled={!validData}
          nextButtonName={add ? 'Add Data Source' : 'Create Application'}
        />
      </Box>
    </Flex>


        
        
      </Flex>
    </Flex>


















    
  );
};

export default AmplitudeIntegration;
