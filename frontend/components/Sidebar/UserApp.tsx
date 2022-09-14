import React from 'react';
import { Avatar, Flex, Radio, Text, useDisclosure } from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import { Provider } from '@lib/domain/provider';

type UserAppProps = {
  app: AppWithIntegrations;
  closeAppsModal: () => void;
  openEditAppsModal: () => void;
  isSelected: boolean;
};

const UserApp = ({
  app,
  closeAppsModal,
  openEditAppsModal,
  isSelected,
}: UserAppProps) => {
  const getProviders = (app: AppWithIntegrations): string => {
    const providerNames = app.integrations.map((integration: any) => {
      return Provider.getDisplayName(integration.provider);
    });
    const uniqueProviders = [...new Set(providerNames)];
    return uniqueProviders.join(', ');
  };

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
        <Flex direction={'column'} gap={'3'}>
          <Flex gap={'1'} direction={'column'}>
            <Text fontSize={'base'} fontWeight={'medium'} lineHeight={'base'}>
              {app.name}
            </Text>
            <Text
              fontSize={'xs-14'}
              fontWeight={'400'}
              lineHeight={'xs-14'}
              textColor={'grey.200'}
            >
              {getProviders(app) || 'GA'}
            </Text>
          </Flex>
          {isSelected && (
            <Text
              fontSize={'base'}
              fontWeight={'medium'}
              lineHeight={'base'}
              decoration={'underline'}
              cursor={'pointer'}
              onClick={() => {
                closeAppsModal();
                openEditAppsModal();
              }}
            >
              Configure
            </Text>
          )}
        </Flex>
        <Radio ml={'auto'} value={app._id} colorScheme={'radioBlack'} />
      </Flex>
    </Flex>
  );
};

export default UserApp;
