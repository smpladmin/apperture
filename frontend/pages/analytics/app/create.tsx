//create
import { useEffect, useRef, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { addApp } from '@lib/services/appService';
import { ErrorResponse } from '@lib/services/util';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import { CheckCircle } from 'phosphor-react';

const Create = () => {
  const toast = useToast();
  const [appName, setAppName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { previousDsId } = router.query;

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const handleNextClick = async () => {
    const res = await addApp(appName);

    if (res.status === 200) {
      router.push({
        pathname: `/analytics/app/[appId]/integration/select`,
        query: { appId: res.data._id, ...router.query },
      });
    } else {
      toast({
        title: (res as ErrorResponse).error.detail,
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    }
  };
  const handleGoBack = () =>
    router.push({
      pathname: `/analytics/home/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });



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
        />
        
          <Flex flexDirection="column" pr={10} justifyContent="center" alignItems="center">
            <Flex flexDirection="row" justifyContent="center" alignItems="center"> 
              <i className="ri-checkbox-circle-fill" style={{ fontSize: '24px' }}></i>              
              <Text fontSize={"sh-18"} fontWeight="semibold" ml={2}>Sign up</Text>
            </Flex>
            <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
          </Flex>
          <Flex flexDirection="column" pr={10} pl={10} justifyContent="center" alignItems="center">
            <Text fontSize={"sh-18"} fontWeight="semibold">Set up workspace</Text>
            <Box minW="250px" w="100%" h="2px" bg="black" mt={5}/>
          </Flex>
          <Flex flexDirection="column" pl={10} justifyContent="center" alignItems="center">
            <Text fontSize={"sh-18"} fontWeight="semibold" color="grey.700">Add Datasource</Text>
            <Box minW="250px" w="100%" h="2px" bg="grey.700" mt={5}/>
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
            bg: 'white', // Change hover color to white
          }}
          
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
          What do you want to call your workspace?
        </Heading>
         <Text fontSize={"sh-14"} textAlign="center" color="grey.500" fontWeight="normal">Usually people use their team’s name as their workspace</Text>
        </Box>
         <Input
          mt={20}
          size="lg"
          width={['100%', '100%', '31.25rem']}
          bg="white.500"
          rounded={10}
          fontSize="base"
          fontWeight={{ base: '400', md: '500' }}
          lineHeight="base"
          height={{ base: '12', md: '15' }}
          textColor="black.400"
          placeholder="Ex- Food Web App"
          py={4}
          px={3.5}
          // focusBorderColor="grey.900"
          borderWidth={'2px'}
          borderRadius={'20'}
          borderColor={'white.200'}
          // boxShadow="0px 2px 4px rgba(0, 0, 0, 0.1)"
          _placeholder={{
            fontSize: '1rem',
            lineHeight: '1.375rem',
            fontWeight: 400,
            color: 'gray.500',
          }}
          ref={inputRef}
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
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
          disabled={!appName}
          onClick={handleNextClick}
        >
          Next
        </Button>
         

    

      </Flex>
    </Flex>
  );
};

export default Create;

// import { useEffect, useRef, useState } from 'react';
// import 'remixicon/fonts/remixicon.css';
// import {
//   Box,
//   Button,
//   Flex,
//   Heading,
//   IconButton,
//   Input,
//   Text,
//   useToast,
// } from '@chakra-ui/react';
// import { useRouter } from 'next/router';
// import { addApp } from '@lib/services/appService';
// import { ErrorResponse } from '@lib/services/util';

// const Create = () => {
//   const toast = useToast();
//   const [appName, setAppName] = useState<string>('');
//   const inputRef = useRef<HTMLInputElement>(null);

//   const router = useRouter();
//   const { previousDsId } = router.query;

//   useEffect(() => {
//     inputRef?.current?.focus();
//   }, []);

//   const handleNextClick = async () => {
//     const res = await addApp(appName);

//     if (res.status === 200) {
//       router.push({
//         pathname: `/analytics/app/[appId]/integration/select`,
//         query: { appId: res.data._id, ...router.query },
//       });
//     } else {
//       toast({
//         title: (res as ErrorResponse).error.detail,
//         status: 'error',
//         variant: 'subtle',
//         isClosable: true,
//       });
//     }
//   };
//   const handleGoBack = () =>
//     router.push({
//       pathname: `/analytics/home/[dsId]`,
//       query: { dsId: previousDsId, apps: 1 },
//     });

//   return (
//     <Flex
//       flexDirection={'column'}
//       h={'full'}
//       py={{ base: 4, md: 10 }}
//       pl={{ base: 4, md: 45 }}
//       pr={{ base: 4, md: 'auto' }}
//       justifyContent={{ base: 'space-between', md: 'start' }}
//     >
//       <Box>
//         <IconButton
//           aria-label="close"
//           variant={'secondary'}
//           icon={<i className="ri-close-fill" />}
//           rounded={'full'}
//           bg={'white'}
//           border={'1px'}
//           borderColor={'white.200'}
//           onClick={handleGoBack}
//         />
//         <Box mt={11} width={{ base: 'full' }} maxW={{ md: '176' }}>
//           <Text
//             textColor={'grey.200'}
//             pb={6}
//             fontSize={'xs-14'}
//             lineHeight={'xs-14'}
//             fontWeight={'medium'}
//           >
//             Step 1 of 3
//           </Text>
//           <Heading
//             as={'h2'}
//             pb={{ base: 8, md: 10 }}
//             fontSize={{ base: 'sh-28', md: 'sh-56' }}
//             lineHeight={{ base: 'sh-28', md: 'sh-56' }}
//             fontWeight={'semibold'}
//           >
//             What would you like to name this application?
//           </Heading>
//           <Input
//             size={'lg'}
//             width={['100%', '100%', '31.25rem']}
//             bg={'white.100'}
//             rounded={'0.25rem'}
//             fontSize={'base'}
//             fontWeight={{ base: '400', md: '500' }}
//             lineHeight={'base'}
//             height={{ base: '12', md: '15' }}
//             textColor={'black.400'}
//             placeholder="Ex- Food Web App"
//             py={4}
//             px={3.5}
//             focusBorderColor={'black.100'}
//             border={'0.15'}
//             _placeholder={{
//               fontSize: '1rem',
//               lineHeight: '1.375rem',
//               fontWeight: 400,
//               color: 'grey.100',
//             }}
//             ref={inputRef}
//             value={appName}
//             onChange={(e) => setAppName(e.target.value)}
//           />
//         </Box>
//       </Box>
//       <Button
//         variant={'primary'}
//         mt={10}
//         rounded={'lg'}
//         bg={'black.100'}
//         p={6}
//         fontSize={'base'}
//         fontWeight={'semibold'}
//         lineHeight={'base'}
//         textColor={'white.100'}
//         width={{ base: 'full', md: '72' }}
//         disabled={!appName}
//         onClick={handleNextClick}
//       >
//         Next
//       </Button>
//     </Flex>
//   );
// };

// export default Create;
