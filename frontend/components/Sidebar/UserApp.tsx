import React from 'react';
import { Avatar, Flex, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { App } from '@lib/domain/app';

type UserAppProps = {
  app: App;
  selectApp: Function;
  value: any;
};

const UserApp = ({ app, selectApp, value }: UserAppProps) => {
  return (
    <RadioGroup value={value} onChange={() => selectApp(app)}>
      <Stack direction="column">
        <Flex
          paddingY={'4'}
          justifyContent={'space-between'}
          alignItems="flex-start"
          borderBottom={'1px'}
          borderStyle={'solid'}
          borderColor={'white.100'}
        >
          <Flex textAlign={'left'} gap={'3'}>
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
            <Flex direction={'column'}>
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
          </Flex>
          <Radio value={app._id} colorScheme="red" />
        </Flex>
      </Stack>
    </RadioGroup>
  );
};

export default UserApp;
