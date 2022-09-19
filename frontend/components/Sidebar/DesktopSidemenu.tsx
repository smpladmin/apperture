import 'remixicon/fonts/remixicon.css';
import logo from '@assets/images/apperture_white-icon.svg';
import Link from 'next/link';
import React from 'react';
import { Flex, Box, Image, Text, Avatar, IconButton } from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';

type SidemenuProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const DesktopSideMenu = ({ selectedApp, openAppsModal }: SidemenuProps) => {
  return (
    <Flex
      height={'full'}
      width={'full'}
      maxWidth={'4rem'}
      direction={'column'}
      alignItems={'center'}
      flexShrink={'0'}
      flexGrow={'0'}
      backgroundColor={'black.100'}
      textAlign={'center'}
      textColor={'white'}
      fontSize={'base'}
      paddingTop={3}
      paddingBottom={12}
    >
      <Box>
        <Image
          src={logo.src}
          paddingBottom={'10'}
          alt="appertureLogo"
          width={'1.5rem'}
          height={'auto'}
        />
      </Box>
      <Box>
        <Text
          fontSize={'xs-10'}
          lineHeight={'xs-10'}
          textColor={'white'}
          opacity={'0.3'}
        >
          APP
        </Text>
        <Flex marginTop={4} gap={2}>
          <Flex
            marginBottom={10}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={100}
            fontWeight={'bold'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            onClick={() => openAppsModal()}
          >
            <Avatar
              name={selectedApp.name}
              fontWeight={'bold'}
              size="sm"
              textColor={'white'}
              h={8}
              w={8}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              cursor={'pointer'}
            />
          </Flex>
        </Flex>
      </Box>

      <Text
        fontSize={'xs-10'}
        lineHeight={'xs-10'}
        textColor={'white'}
        opacity={'0.3'}
        paddingX={{ base: '4', md: 'auto' }}
        paddingBottom={{ base: '4', md: 'auto' }}
      >
        EXPLORE
      </Text>

      <Box>
        <Flex direction={'column'} alignItems={'center'} gap={5} paddingTop={5}>
          <IconButton
            aria-label="close"
            icon={<i className="ri-route-fill" />}
            rounded={'lg'}
            h={10}
            w={10}
            bg={'black.0'}
            fontWeight={'500'}
            color={'grey.100'}
            _hover={{
              backgroundColor: 'white.0',
              color: 'white',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          />

          <IconButton
            aria-label="close"
            icon={<i className="ri-lightbulb-line" />}
            rounded={'lg'}
            h={10}
            w={10}
            bg={'black.0'}
            fontWeight={'500'}
            color={'grey.100'}
            _hover={{
              backgroundColor: 'white.0',
              color: 'white',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          />
          <IconButton
            aria-label="close"
            icon={<i className="ri-bookmark-line" />}
            rounded={'lg'}
            h={10}
            w={10}
            bg={'black.0'}
            fontWeight={'500'}
            color={'grey.100'}
            _hover={{
              backgroundColor: 'white.0',
              color: 'white',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          />
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
      <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/logout`}>
        <Box marginTop={'auto'}>
          <IconButton
            aria-label="close"
            icon={<i className="ri-logout-box-r-line" />}
            rounded={'lg'}
            h={10}
            w={10}
            bg={'black.0'}
            fontWeight={'500'}
            color={'grey.100'}
            _hover={{
              backgroundColor: 'white.0',
              color: 'white',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          />
        </Box>
      </Link>
    </Flex>
  );
};

export default DesktopSideMenu;
