import React from 'react';
import { Avatar, Flex, Radio, Text } from '@chakra-ui/react';
import { App } from '@lib/domain/app';

type UserAppProps = {
  app: App;
};

const UserApp = ({ app }: UserAppProps) => {
  return (
    <Flex
      paddingY={'4'}
      justifyContent={'space-between'}
      borderBottom={'1px'}
      borderStyle={'solid'}
      borderColor={'white.100'}
    >
      <Flex
        w={'full'}
        as={'label'}
        cursor={'pointer'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={'3'}
      >
        <Avatar
          name={app.name}
          fontWeight={'bold'}
          size="sm"
          textColor={'white'}
          h={{ base: '8', md: '12' }}
          w={{ base: '8', md: '12' }}
          fontSize={{ base: 'xs', md: 'xs-14' }}
          lineHeight={{ base: 'xs', md: 'xs-14' }}
        />
        <Flex direction={'column'} ml={''}>
          <Text fontSize={'base'} fontWeight={'500'} lineHeight={'base'}>
            {app.name}
          </Text>
          <Text
            fontSize={'xs-14'}
            fontWeight={'400'}
            lineHeight={'xs-14'}
            textColor={'grey.200'}
          >
            GA, Mix Panel
          </Text>
        </Flex>
        <Radio ml={'auto'} value={app._id} colorScheme={'radio'} />
      </Flex>
    </Flex>
  );
};

export default UserApp;
