import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Image,
  Text,
  useToast,
} from '@chakra-ui/react';
import { BLACK, GREY_600 } from '@theme/index';
import { Envelope, Eye, EyeClosed, LockKey } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import { LoginPageState } from '..';
import { RegisterUser } from '@lib/services/userService';
import glogo from '@assets/images/google_white_square.jpg';
import { useRouter } from 'next/router';

import { BACKEND_BASE_URL } from 'config';

const RegisterForm = ({ setPageState }: { setPageState: Function }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registeringUser, setRegisteringUser] = useState(false);

  const toast = useToast();

  const router = useRouter();
  useEffect(() => {
    if (!registeringUser) return;
    const registerUser = async () => {
      const response = await RegisterUser(
        firstName,
        lastName,
        email,
        password,
      );
      setRegisteringUser(false);
      if (response.status !== 200) {
        toast({
          title: response?.data?.detail || 'Something went wrong!',
          status: 'error',
          variant: 'subtle',
          isClosable: true,
        });
        return;
      }
      router.push({
        pathname: '/',
      });
    };
    registerUser();
  }, [registeringUser]);

  const handleLogin = (e: any) => {
    if (!(firstName || lastName)) {
      toast({
        title: "Name can't be left blank",
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Password do not match',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
      return;
    }
    setRegisteringUser(true);
  };
  const handleEmail = (e: any) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };
  const handleFirstName = (e: any) => {
    setFirstName(e.target.value);
  };
  const handleLastName = (e: any) => {
    setLastName(e.target.value);
  };
  const handleConfirmPassword = (e: any) => {
    setConfirmPassword(e.target.value);
  };


  return (
    <Flex
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
          <Image src={glogo.src} w={7} borderRadius={5} />
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
          Register
        </Text>
        <Box flexGrow={'1'} height={'1px'} bg={'white.200'}></Box>
      </Flex>
      <Box>
        <form id="login-form" onSubmit={handleLogin}>
          <FormControl>
            <Flex direction="column" gap={7}>
              <Flex direction="column" gap={3}>
                <Flex direction="column" gap={3}>
                  <FormLabel
                    fontSize={'xs-14'}
                    lineHeight={'lh-130'}
                    color={'grey.800'}
                    mb={0}
                  >
                    First Name
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Envelope size={16} color={GREY_600} />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="John"
                      onChange={handleFirstName}
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
                    Last Name
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Envelope size={16} color={GREY_600} />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="Doe"
                      onChange={handleLastName}
                      bg={'white.500'}
                      fontSize={'xs-12'}
                      lineHeight={'lh-130'}
                      focusBorderColor={BLACK}
                    />
                  </InputGroup>
                </Flex>
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="**************"
                    onChange={handlePassword}
                    bg={'white.500'}
                    fontSize={'xs-12'}
                    lineHeight={'lh-130'}
                    focusBorderColor={BLACK}
                  />
                  <InputRightElement w={4} marginRight={3} cursor={'pointer'}>
                    <Flex onClick={() => setShowPassword((state) => !state)}>
                      {showPassword ? <Eye /> : <EyeClosed />}
                    </Flex>
                  </InputRightElement>
                </InputGroup>
              </Flex>
              <Flex direction="column" gap={3}>
                <FormLabel
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  color={'grey.800'}
                  mb={0}
                >
                  Confirm Password
                </FormLabel>

                <InputGroup>
                  <InputLeftElement>
                    <LockKey size={16} color={GREY_600} />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="**************"
                    onChange={handleConfirmPassword}
                    bg={'white.500'}
                    fontSize={'xs-12'}
                    lineHeight={'lh-130'}
                    focusBorderColor={BLACK}
                  />
                  <InputRightElement w={4} marginRight={3} cursor={'pointer'}>
                    <Flex
                      onClick={() => setShowConfirmPassword((state) => !state)}
                    >
                      {showConfirmPassword ? <Eye /> : <EyeClosed />}
                    </Flex>
                  </InputRightElement>
                </InputGroup>
              </Flex>

              <Flex gap={1}>
                <Button
                  borderWidth={'1px'}
                  onClick={handleLogin}
                  form={'login-form'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  fontWeight={500}
                  variant={'dark'}
                  borderRadius={10}
                  w={'50%'}
                >
                  Sign up
                </Button>
                <Button
                  borderWidth={'1px'}
                  form={'login-form'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  fontWeight={500}
                  borderRadius={10}
                  variant={'secondary'}
                  w={'50%'}
                  onClick={() => setPageState(LoginPageState.LOGIN)}
                >
                  Back to Login
                </Button>
              </Flex>
            </Flex>
          </FormControl>
        </form>
        <Flex
          ml={2}
          mt={5}
          gap={1}
          justifyContent="left"
          fontSize={{ base: 'xs-12', md: 'xs-12' }}
          lineHeight={{ base: 'sh-18', md: 'sh-18' }}
        >
          <Text fontWeight="normal" color="grey.800">
            I agree to Apperture&apos;s
          </Text>
          <Link href="https://apperture.io/terms-and-conditions">
            Terms and conditions
          </Link>
          <Text fontWeight="normal" color="grey.800">
            and
          </Text>
          <Link href="https://www.apperture.io/privacy-policy">
            Privacy Policy
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
};

export default RegisterForm;
