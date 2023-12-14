import React from 'react';
import {
  Avatar,
  Button,
  Flex,
  Radio,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import { GREY_500 } from '@theme/index';
import { Provider } from '@lib/domain/provider';
import { UserPlus } from '@phosphor-icons/react';
import ShareAppModal from './ShareAppModal';
import { AppertureUser } from '@lib/domain/user';

type UserAppProps = {
  app: AppWithIntegrations;
  openConfigureAppsModal: () => void;
  setRefreshAppUserList: Function;
  isSelected: boolean;
  users: AppertureUser[];
};

const UserApp = ({
  app,
  openConfigureAppsModal,
  setRefreshAppUserList,
  isSelected,
  users,
}: UserAppProps) => {
  const getProviders = (app: AppWithIntegrations): string => {
    const providerNames = app.integrations.map((integration: any) => {
      return Provider.getDisplayName(integration.provider);
    });
    const uniqueProviders = [...new Set(providerNames)];
    return uniqueProviders.join(', ');
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Flex
        paddingY={'4'}
        justifyContent={'space-between'}
        alignItems={'center'}
        borderBottom={'1px'}
        borderStyle={'solid'}
        borderColor={'white.100'}
        gap={'3'}
      >
        <Flex
          w={'full'}
          as={'label'}
          cursor={'pointer'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          gap={'3'}
        >
          <Radio ml={'auto'} value={app._id} colorScheme={'radioBlack'} />
          <Flex
            w={'full'}
            alignItems={'center'}
            justifyContent={'flex-start'}
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
                <Text
                  fontSize={{ base: 'xs-14', md: 'base' }}
                  fontWeight={{ base: '600', md: '500' }}
                  lineHeight={'base'}
                >
                  {app.name}
                </Text>
                <Text
                  fontSize={{ base: 'xs-12', md: 'xs-14' }}
                  fontWeight={'400'}
                  lineHeight={{ base: 'xs-12', md: 'xs-14' }}
                  textColor={'grey.200'}
                >
                  {getProviders(app)}
                </Text>
              </Flex>
              {isSelected && !app.shared && (
                <Text
                  fontSize={'base'}
                  fontWeight={'medium'}
                  lineHeight={'base'}
                  decoration={'underline'}
                  cursor={'pointer'}
                  onClick={() => {
                    openConfigureAppsModal();
                  }}
                >
                  View Connections
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Button
          gap={'4px'}
          py={'6px'}
          paddingLeft={3}
          paddingRight={4}
          bgColor={'inherit'}
          isDisabled={!isSelected}
          _hover={{ bg: 'transparent' }}
          onClick={onOpen}
        >
          <UserPlus size={28} color={GREY_500} />
          <Text
            color={GREY_500}
            fontSize={'xs-14'}
            fontWeight={'400'}
            lineHeight={'lh-130'}
          >
            Share
          </Text>
        </Button>
      </Flex>
      <ShareAppModal
        isOpen={isOpen}
        onClose={onClose}
        appId={app._id}
        users={users}
        setRefreshAppUserList={setRefreshAppUserList}
      />
    </>
  );
};

export default UserApp;
