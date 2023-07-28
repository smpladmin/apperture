import logo from '@assets/images/apperturelogonew.svg';
import glogo from '@assets/images/google_white_square.jpg';
import Link from 'next/link';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Image,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
} from '@chakra-ui/react';
import { BACKEND_BASE_URL } from 'config';
import LoginWithPasswordModal from './Components/LoginWithPasswordModal';
import React, { useEffect, useState, useRef } from 'react';
import { Envelope, Eye, EyeClosed, LockKey } from 'phosphor-react';
import { BLACK, GREY_600 } from '@theme/index';
import {
  IntegrationContainer,
  LeftContainer,
  RightContainer,
} from '@components/Onboarding';

const Loginscreen = () => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  useEffect(() => {
    window?.posthog?.reset?.(true);
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const redirectionRef = useRef<any>();

  const handleEmail = (e: any) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (email && password) redirectionRef.current.click();
  };

  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  return (
    <IntegrationContainer>
      
        <LeftContainer />
     
      <RightContainer>
        <Box
          p={8}
          pt={{ base: 10, md: 10 }}
          bg="white"
          textColor="grey.900"
          height={'100%'}
          overflowY={'auto'}
        >
          <a
            ref={redirectionRef}
            href={`${BACKEND_BASE_URL}/login/password?email=${email}&password=${password}`}
          ></a>
          <Flex direction="column" alignItems={'center'}>
            <Box textAlign={'center'}>
              <Heading
                as="h1"
                mt={22}
                fontSize={{ base: 'sh-20', md: 'sh-36' }}
                lineHeight={{ base: 'sh-20', md: 'sh-36' }}
                fontWeight={{ base: '600', md: '700' }}
              >
                Welcome to apperture
              </Heading>
              <Text
                fontSize={{ base: 'xs-12', md: 'xs-14' }}
                lineHeight={'sh-18'}
                fontWeight={'normal'}
                textColor={'grey.500'}
                maxW={90}
                m={'auto'}
                mt={3}
              >
                Let’s get your account set up
              </Text>
            </Box>

            <Flex
              mt={5}
              p={10}
              bg={'white'}
              w={'full'}
              maxW={120}
              borderRadius={'12px'}
              borderWidth={0}
              borderColor={'grey.400'}
              gap={7}
              direction={'column'}
            >
            <Link href={`${BACKEND_BASE_URL}/login`}>
                        <Flex
                          gap={22}
                          padding={2}
                          alignItems={'center'}
                          justifyContent={'start'}
                          height={'auto'}
                          bg={'#5093EC'}
                          borderWidth={1}
                          borderColor={'grey.400'}
                          borderStyle={'solid'}
                          cursor={'pointer'}
                          borderRadius={'8'}
                          _hover={{ background: '#5093EC' }}
                        >
                          <Image src={glogo.src} w={7} borderRadius={5}/>
                          <Text
                            fontSize={'xs-14'}
                            lineHeight={'lh-135'}
                            fontWeight={'medium'}
                            textColor={'white'}
                          >
                            Continue with Google
                          </Text>
                        </Flex>
                      </Link>
                      <Flex alignItems={'center'} gap={2}>
                        <Box flexGrow={'1'} height={'1px'} bg={'white.200'}></Box>
                        <Text
                          fontSize={'xs-12'}
                          lineHeight={'lh-135'}
                          fontWeight={'medium'}
                          textColor={'grey.600'}
                        >
                          or continue with
                        </Text>
                        <Box flexGrow={'1'} height={'1px'} bg={'white.200'}></Box>
                      </Flex>
              <Box>
                <a
                  ref={redirectionRef}
                  href={`${BACKEND_BASE_URL}/login/password?email=${email}&password=${password}`}
                ></a>
                <form id="login-form" onSubmit={handleLogin}>
                  <FormControl>
                    <Flex direction="column" gap={7}>
                      <Flex direction="column" gap={3}>
                        <FormLabel
                          fontSize={'xs-14'}
                          lineHeight={'lh-130'}
                          color={'grey.800'}
                          mb={0}
                        >
                          Email
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Envelope size={16} color={GREY_600} />
                          </InputLeftElement>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            onChange={handleEmail}
                            bg={'white.500'}
                            fontSize={'xs-12'}
                            lineHeight={'lh-130'}
                            focusBorderColor={BLACK}
                          />
                        </InputGroup>
                      </Flex>
                      <Flex direction="column" gap={3}>
                        <FormLabel
                          fontSize={'xs-14'}
                          lineHeight={'lh-130'}
                          color={'grey.800'}
                          mb={0}
                        >
                          Password
                        </FormLabel>

                        <InputGroup>
                          <InputLeftElement>
                            <LockKey size={16} color={GREY_600} />
                          </InputLeftElement>
                          <Input
                            type={show ? 'text' : 'password'}
                            placeholder="**************"
                            onChange={handlePassword}
                            bg={'white.500'}
                            fontSize={'xs-12'}
                            lineHeight={'lh-130'}
                            focusBorderColor={BLACK}
                          />
                          <InputRightElement
                            w={4}
                            marginRight={3}
                            cursor={'pointer'}
                          >
                            <Flex onClick={handleClick}>
                              {show ? <Eye /> : <EyeClosed />}
                            </Flex>
                          </InputRightElement>
                        </InputGroup>
                      </Flex>
                      <Button
                        borderWidth={'1px'}
                        type={'submit'}
                        form={'login-form'}
                        fontSize={'xs-14'}
                        lineHeight={'lh-130'}
                        fontWeight={500}
                        variant={'dark'}
                        borderRadius={10}
                      >
                        Sign in
                      </Button>
                      
                      
                    </Flex>
                  </FormControl>
                </form>
                <Flex ml={2} mt={5} gap={1} justifyContent="left" fontSize={{ base: 'xs-12', md: 'xs-12' }}
                    lineHeight={{ base: 'sh-18', md: 'sh-18' }}>
                  <Text
                    fontWeight="normal"
                    color="grey.800"
                  >
                    I agree to Apperture's
                  </Text>
                  <Link href="https://apperture.io/terms-and-conditions"  fontSize={{ base: 'xs-14', md: 'xs-14' }} fontWeight="extrabold" textDecoration="underline"  style={{textDecoration:"underline"}}>Terms and conditions</Link>
                  <Text fontWeight="normal" color="grey.800">and</Text>
                  <Link href="https://www.apperture.io/privacy-policy" fontWeight="extrabold" >Privacy Policy</Link>
                </Flex>
                
              </Box>
            </Flex>

            {/* <LoginWithPasswordModal isOpen={isOpen} onClose={onClose} /> */}
          </Flex>
        </Box>
    </RightContainer>
  </IntegrationContainer>
  );
};

export default Loginscreen;
