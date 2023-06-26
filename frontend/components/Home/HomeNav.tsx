import { Avatar, Flex, Image, Box, Link } from '@chakra-ui/react';
import React from 'react';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import { GearSix, Database, Stack } from '@phosphor-icons/react';
import { WHITE_DEFAULT } from '@theme/index';
import clickStream from '@assets/images/clickstream.svg';

const HomeNav = () => {
  return (
    <Flex
      justifyContent={'space-between'}
      alignItems={'center'}
      bg={'grey.900'}
      py={5}
      px={6}
    >
      <Image src={logo.src} color={'white'}></Image>
      <Flex color={WHITE_DEFAULT} gap={5} alignItems={'center'}>
        <Link padding={'6px'}>
          <Database size={20} />
        </Link>
        <Link padding={'6px'}>
          <Stack size={20} />
        </Link>
        <Link padding={'6px'}>
          <Image src={clickStream.src} alt="Clickstream"></Image>
        </Link>
        <Link padding={'6px'} href="/analytics/settings">
          <GearSix size={20} />
        </Link>
        <Flex
        // onClick={() => openAppsModal()}
        >
          <Avatar
            name={'name'} //selectedApp.name
            fontWeight={'bold'}
            size="sm"
            textColor={'white'}
            h={8}
            w={8}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            cursor={'pointer'}
            borderRadius={8}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HomeNav;
