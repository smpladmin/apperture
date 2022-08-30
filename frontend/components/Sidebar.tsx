import styles from '../components/Sidebar.module.css';
import 'remixicon/fonts/remixicon.css';
import logo from '../assets/images/apperture_white-icon.svg';
import Link from 'next/link';
import { Flex, Box, Image, Text } from '@chakra-ui/react';

const Sidebar = () => {
  return (
    <Flex
      height={'full'}
      width={'full'}
      maxWidth={'4rem'}
      direction={'column'}
      alignItems={'center'}
      backgroundColor={'black.100'}
      textAlign={'center'}
      textColor={'white'}
      fontSize={'base'}
      paddingTop={3}
      paddingBottom={12}
    >
      <Image src={logo.src} paddingBottom={'10'} alt="appertureLogo" />
      <Box>
        <Text fontSize={'xs-10'} lineHeight={'xs-10'} opacity={'0.3'}>
          APP
        </Text>
        <Flex
          marginTop={4}
          marginBottom={10}
          h={8}
          w={8}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={100}
          bg={'yellow'}
          fontWeight={'bold'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
        >
          <Text>ZA</Text>
        </Flex>
      </Box>
      <Box>
        <Text fontSize={'xs-10'} lineHeight={'xs-10'} opacity={'0.3'}>
          EXPLORE
        </Text>
        <Flex direction={'column'} alignItems={'center'} gap={5} paddingTop={5}>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={'lg'}
            h={10}
            w={10}
            cursor={'pointer'}
            color={'grey.100'}
            transition="all .25s ease"
            background="rgba(14,14,26,0)"
            _hover={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'white',
            }}
          >
            <Box sx={{ transform: 'rotate(45deg)' }}>
              <i className="ri-route-fill"></i>
            </Box>
          </Flex>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={'lg'}
            h={10}
            w={10}
            cursor={'pointer'}
            color={'grey.100'}
            transition="all .25s ease"
            background="rgba(14,14,26,0)"
            _hover={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'white',
            }}
          >
            <i className="ri-lightbulb-line"></i>
          </Flex>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={'lg'}
            h={10}
            w={10}
            cursor={'pointer'}
            color={'grey.100'}
            transition="all .25s ease"
            background="rgba(14,14,26,0)"
            _hover={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'white',
            }}
          >
            <i className="ri-bookmark-line"></i>
          </Flex>
          <Box
            marginTop={-4}
            borderRadius={'sm'}
            backgroundColor={'green'}
            fontSize={'xs-8'}
            lineHeight={'xs-8'}
            fontWeight={'medium'}
            padding={1}
          >
            Coming soon
          </Box>
        </Flex>
      </Box>
      <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/logout`}>
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={'lg'}
          marginTop={'auto'}
          h={10}
          w={10}
          cursor={'pointer'}
          color={'grey.100'}
          transition="all .25s ease"
          background="rgba(14,14,26,0)"
          _hover={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            color: 'white',
          }}
        >
          <i className="ri-logout-box-r-line"></i>
        </Flex>
      </Link>
    </Flex>
  );
};

export default Sidebar;
