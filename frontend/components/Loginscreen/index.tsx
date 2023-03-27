import logo from '@assets/images/Logo_login.svg';
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
} from '@chakra-ui/react';
import { BACKEND_BASE_URL } from 'config';
import LoginWithPasswordModal from './Components/LoginWithPasswordModal';
import { useEffect } from 'react';

const Loginscreen = () => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  useEffect(() => {
    window.posthog.reset && window.posthog.reset(true);
  }, []);

  return (
    <Box
      p={8}
      pt={{ base: 33, md: 40 }}
      bg="black.DEFAULT"
      textColor="white.DEFAULT"
      height={'100%'}
      overflowY={'auto'}
    >
      <Flex
        direction="column"
        justifyContent="space-between"
        marginX={{ md: 36 }}
        marginLeft={{ lg: 45 }}
        height={'full'}
        gap={8}
      >
        <Box>
          <Box mb={3} h={{ base: 25, md: 30 }} w={{ base: 25, md: 30 }}>
            <Image src={logo.src} alt="Apperture logo" />
          </Box>
          <Heading
            as="h1"
            mt={12}
            fontSize={{ base: 'sh-34', md: 'sh-56' }}
            lineHeight={{ base: 'sh-34', md: 'sh-56' }}
            fontWeight={{ base: '500', md: '400' }}
          >
            Product Analytics <br /> for everyone
          </Heading>
          <Text
            mt={4}
            fontSize={{ base: 'xs', md: 'lg' }}
            lineHeight={'sh-18'}
            decoration={'underline'}
            fontWeight={'normal'}
            textColor={'grey.DEFAULT'}
          >
            Terms of use
          </Text>
        </Box>
        <Flex
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default Loginscreen;
