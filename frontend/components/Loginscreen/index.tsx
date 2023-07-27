import logo from '@assets/images/apperturelogonew.svg';
import glogo from '@assets/images/Google_login.svg';
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
    <Box
      p={8}
      pt={{ base: 10, md: 10 }}
      bg="white.400"
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
          <Flex w={'full'} justifyContent={'center'}>
            <Image src={logo.src} alt="Apperture logo" />
          </Flex>
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
            AI powered spreadsheets for instant answers to complex questions
          </Text>
        </Box>
        <Flex
          mt={10}
          p={10}
          bg={'white'}
          w={'full'}
          maxW={120}
          borderRadius={'12px'}
          borderWidth={1}
          borderColor={'grey.400'}
          gap={7}
          direction={'column'}
        >
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
                      color={'grey.900'}
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
                      color={'grey.900'}
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
                  >
                    Sign in
                  </Button>
                  <Flex alignItems={'center'} gap={2}>
                    <Box flexGrow={'1'} height={'1px'} bg={'white.200'}></Box>
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'lh-135'}
                      fontWeight={'medium'}
                      textColor={'grey.600'}
                    >
                      OR
                    </Text>
                    <Box flexGrow={'1'} height={'1px'} bg={'white.200'}></Box>
                  </Flex>
                  <Link href={`${BACKEND_BASE_URL}/login`}>
                    <Flex
                      gap={2}
                      padding={4}
                      alignItems={'center'}
                      justifyContent={'center'}
                      height={'auto'}
                      bg={'white'}
                      borderWidth={1}
                      borderColor={'grey.400'}
                      borderStyle={'solid'}
                      cursor={'pointer'}
                      borderRadius={'8'}
                      _hover={{ background: 'white.500' }}
                    >
                      <Image src={glogo.src} w={5} />
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'lh-135'}
                        fontWeight={'medium'}
                        textColor={'black'}
                      >
                        Continue with Google
                      </Text>
                    </Flex>
                  </Link>
                </Flex>
              </FormControl>
            </form>
          </Box>
        </Flex>

        {/* <LoginWithPasswordModal isOpen={isOpen} onClose={onClose} /> */}
      </Flex>
    </Box>
  );
};

export default Loginscreen;
