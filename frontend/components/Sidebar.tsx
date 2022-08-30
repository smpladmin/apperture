import styles from '../components/Sidebar.module.css';
import 'remixicon/fonts/remixicon.css';
import logo from '../assets/images/apperture_white-icon.svg';
import logoSmall from '../assets/images/apperture_small-icon.svg';
import Link from 'next/link';
import {
  Flex,
  Box,
  Image,
  Text,
  Avatar,
  Divider,
  AbsoluteCenter,
  Center,
} from '@chakra-ui/react';

const Sidebar = () => {
  return (
    <Flex
      zIndex={1}
      // hidden for now, Need to implement using drawer component
      display={{ base: 'none', md: 'flex' }}
      height={'full'}
      width={{ base: '18.25rem', md: 'full' }}
      maxWidth={{ base: '18.25rem', md: '4rem' }}
      direction={'column'}
      alignItems={{ base: 'flex-start', md: 'center' }}
      flexShrink={'0'}
      flexGrow={'0'}
      backgroundColor={{ base: 'white', md: 'black.100' }}
      textAlign={'center'}
      textColor={{ base: 'black', md: 'white' }}
      fontSize={'base'}
      paddingTop={{ md: 3 }}
      paddingBottom={{ md: 12 }}
    >
      <Box display={{ base: 'block', md: 'none' }}>
        <Image
          src={logoSmall.src}
          alt="appertureLogo"
          width={'7.125rem'}
          height={'auto'}
          paddingX={{ base: '4' }}
          paddingTop={{ base: '4' }}
        />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <Image
          src={logo.src}
          paddingBottom={'10'}
          alt="appertureLogo"
          width={'1.5rem'}
          height={'auto'}
        />
      </Box>

      <Box display={{ base: 'block', md: 'none' }} width={'full'}>
        <Divider
          orientation="horizontal"
          marginY={'4'}
          borderColor={'white.200'}
          opacity={1}
        />
      </Box>
      <Box
        width={{ base: 'full', md: 'auto' }}
        display={{ base: 'flex', md: 'block' }}
        flexDirection={'column'}
        alignItems={'flex-start'}
      >
        <Text
          fontSize={{ base: 'xs-12', md: 'xs-10' }}
          lineHeight={{ base: 'xs-12', md: 'xs-10' }}
          textColor={{ base: '#B2B2B5', md: 'white' }}
          opacity={{ base: '1', md: '0.3' }}
          paddingX={{ base: '4', md: '0' }}
        >
          APP
        </Text>
        <Flex
          width={'full'}
          paddingX={{ base: '4', md: 'auto' }}
          marginTop={4}
          gap={2}
        >
          <Flex
            marginBottom={{ base: 0, md: 10 }}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={100}
            fontWeight={'bold'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
          >
            <Avatar
              name="Zomato Partner App"
              fontWeight={'bold'}
              size="sm"
              textColor={'white'}
              h={{ base: 10, md: 8 }}
              w={{ base: 10, md: 8 }}
              fontSize={{ base: 'xs', md: 'xs-14' }}
              lineHeight={'xs-14'}
            ></Avatar>
          </Flex>
          <Box display={{ base: 'block', md: 'none' }} width={'full'}>
            <Flex
              width={'full'}
              gap={2}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box textAlign={'left'}>
                <Text
                  fontSize={'base'}
                  fontWeight={'semibold'}
                  lineHeight={'base'}
                >
                  Zomato Partner App
                </Text>
                <Text
                  fontSize={'xs-12'}
                  fontWeight={'regular'}
                  lineHeight={'xs-12'}
                >
                  ID 098762
                </Text>
              </Box>
              <i className="ri-arrow-right-s-line"></i>
            </Flex>
          </Box>
        </Flex>
        <Box display={{ base: 'block', md: 'none' }}>
          <Divider
            orientation="horizontal"
            marginY={'4'}
            borderColor={'white.200'}
            opacity={1}
          />
        </Box>
      </Box>
      <Text
        fontSize={{ base: 'xs-12', md: 'xs-10' }}
        lineHeight={{ base: 'xs-12', md: 'xs-10' }}
        textColor={{ base: '#B2B2B5', md: 'white' }}
        opacity={{ base: '1', md: '0.3' }}
        paddingX={{ base: '4', md: 'auto' }}
        paddingBottom={{ base: '4', md: 'auto' }}
      >
        EXPLORE
      </Text>
      <Box display={{ base: 'block', md: 'none' }} width="full">
        <Box width={'full'}>
          <Flex
            width={'full'}
            justifyContent={'flex-start'}
            gap={'3'}
            paddingX={'4'}
            paddingY={'5'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <i className="ri-route-fill"></i> Map
          </Flex>
          <Flex
            width={'full'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={'4'}
            paddingY={'5'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Flex width={'full'} justifyContent={'flex-start'} gap={'3'}>
              <i className="ri-lightbulb-line"></i> Insights
            </Flex>
            <Box
              flexShrink={0}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={{ base: 'xs-10', md: 'xs-8' }}
              lineHeight={{ base: 'xs-10', md: 'xs-8' }}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
          <Flex
            width={'full'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={'4'}
            paddingY={'5'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Flex width={'full'} justifyContent={'flex-start'} gap={'3'}>
              <i className="ri-bookmark-line"></i> Saved
            </Flex>
            <Box
              flexShrink={0}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={{ base: 'xs-10', md: 'xs-8' }}
              lineHeight={{ base: 'xs-10', md: 'xs-8' }}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
        </Box>
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <Box>
          <Flex
            direction={'column'}
            alignItems={'center'}
            gap={5}
            paddingTop={5}
          >
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              borderRadius={'lg'}
              h={{ base: 'auto', md: 10 }}
              w={{ base: 'auto', md: 10 }}
              cursor={'pointer'}
              color={'grey.100'}
              transition={'all .25s ease'}
              background={'rgba(14,14,26,0)'}
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
              transition={'all .25s ease'}
              background={'rgba(14,14,26,0)'}
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
              transition={'all .25s ease'}
              background={'rgba(14,14,26,0)'}
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
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
        </Box>
      </Box>
      <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/logout`}>
        <Box marginTop={'auto'} width={{ base: 'full', md: 'auto' }}>
          <Box display={{ base: 'block', md: 'none' }}>
            <Flex
              width={'full'}
              justifyContent={'flex-start'}
              gap={'3'}
              paddingX={'4'}
              paddingY={'5'}
              fontWeight={'400'}
              backgroundColor={'white'}
              _hover={{
                backgroundColor: 'white.100',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <i className="ri-logout-box-r-line"></i> Logout
            </Flex>
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              borderRadius={'lg'}
              h={10}
              w={10}
              cursor={'pointer'}
              color={'grey.100'}
              transition={'all .25s ease'}
              background={'rgba(14,14,26,0)'}
              _hover={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'white',
              }}
            >
              <i className="ri-logout-box-r-line"></i>
            </Flex>
          </Box>
        </Box>
      </Link>
    </Flex>
  );
};

export default Sidebar;
