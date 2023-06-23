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
} from '@chakra-ui/react';
import { BACKEND_BASE_URL } from 'config';
import LoginWithPasswordModal from './Components/LoginWithPasswordModal';
import { useEffect, useState, useRef } from 'react';

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

  return (
    <Box
      p={8}
      pt={{ base: 10, md: 10 }}
      bg="white.400"
      textColor="grey.900"
      height={'100%'}
      overflowY={'auto'}
    >
      <Flex direction="column" alignItems={'center'}>
        <Box textAlign={'center'}>
          <Flex w={'full'} justifyContent={'center'}>
            <Image src={logo.src} alt="Apperture logo" />
          </Flex>
          <Heading
            as="h1"
            mt={36}
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
            >
              {''}
            </a>
            <form id="login-form" onSubmit={handleLogin}>
              <FormControl>
                <Flex direction="column" gap={7}>
                  <Flex direction="column" gap={3}>
                    <FormLabel
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      color={'grey.900'}
                      mb={0}
                    >
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      placeholder="John@doe.com"
                      onChange={handleEmail}
                    />
                  </Flex>
                  <Flex direction="column" gap={3}>
                    <FormLabel
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      color={'grey.900'}
                      mb={0}
                    >
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      placeholder="xxxxxxxxxxxx"
                      onChange={handlePassword}
                    />
                  </Flex>
                  <Button
                    borderWidth={'1px'}
                    type={'submit'}
                    form={'login-form'}
                    variant={'secondary'}
                  >
                    Log In
                  </Button>
                </Flex>
              </FormControl>
            </form>
          </Box>
        </Flex>

        {/* <Flex
          mb={2}
          direction={'column'}
          alignItems={'center'}
          gap={6}
          maxW={{ md: 141 }}
        >
          <Link href={`${BACKEND_BASE_URL}/login`}>
            <Button
              p={{ base: 7, md: 10 }}
              fontSize={{ base: 'base', md: 'sh-20' }}
              lineHeight={{ base: 'base', md: 'sh-20' }}
              fontWeight={'semibold'}
              textColor={'black.100'}
              w={'full'}
              gap={{ base: 4, md: 6 }}
            >
              <Image src={glogo.src} alt="Google logo" />
              <Text>Sign up with Google</Text>
            </Button>
          </Link>
          <Text
            fontSize={{ base: 'xs-14', md: 'sh-20' }}
            lineHeight={{ base: 'xs-14', md: 'sh-20' }}
            fontWeight={'normal'}
            textColor={'grey.DEFAULT'}
          >
            Already a user?{' '}
            <Link href={`${BACKEND_BASE_URL}/login`}>
              <Text
                as={'span'}
                cursor={'pointer'}
                fontWeight={'medium'}
                textColor={'white.DEFAULT'}
                decoration={'underline'}
              >
                Log in
              </Text>
            </Link>
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'sh-20' }}
            lineHeight={{ base: 'xs-14', md: 'sh-20' }}
            as={'span'}
            cursor={'pointer'}
            fontWeight={'light'}
            textColor={'white.DEFAULT'}
            decoration={'underline'}
            marginLeft={3}
            onClick={onOpen}
          >
            Login with password
          </Text>
          <LoginWithPasswordModal isOpen={isOpen} onClose={onClose} />
        </Flex> */}
      </Flex>
    </Box>
  );
};

export default Loginscreen;
