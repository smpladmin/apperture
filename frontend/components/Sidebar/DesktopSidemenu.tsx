import 'remixicon/fonts/remixicon.css';
import logo from '@assets/images/apperture_white-icon.svg';
import React from 'react';
import {
  Flex,
  Box,
  Image,
  Avatar,
  IconButton,
  useDisclosure,
  Tooltip,
  Text,
  Divider,
} from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import LogoutModal from '@components/Logout';
import { useRouter } from 'next/router';

type SidemenuProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const DesktopSideMenu = ({ selectedApp, openAppsModal }: SidemenuProps) => {
  const {
    isOpen: isLogoutModalOpen,
    onOpen: openLogoutModal,
    onClose: closeLogoutModal,
  } = useDisclosure();

  const router = useRouter();
  const path = router.pathname;
  const { dsId } = router.query;

  const isPageActive = (pagePath: string) => {
    return path.includes(pagePath);
  };

  const handleRedirect = (pathname: string) => {
    if (path.includes(pathname)) return;

    router.push({
      pathname,
      query: { dsId: dsId },
    });
  };

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
      overflowY={'auto'}
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
        <Flex gap={2}>
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
      <Flex direction={'column'} justifyContent={'space-between'} h={'full'}>
        <Flex direction={'column'} alignItems={'center'} gap={2}>
          <Tooltip
            label={'Explore'}
            aria-label={'Explore'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Explore"
              icon={
                <i
                  className={
                    isPageActive('explore') ? 'ri-route-fill' : 'ri-route-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('explore') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/explore/[dsId]')}
            />
          </Tooltip>

          <Tooltip
            label={'Alerts'}
            aria-label={'Explore'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Explore"
              icon={
                <i
                  className={
                    isPageActive('notification')
                      ? 'ri-notification-fill'
                      : 'ri-notification-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('notification') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() =>
                handleRedirect('/analytics/notification/list/[dsId]')
              }
            />
          </Tooltip>

          <Divider borderColor={'black.50'} opacity={'0.3'} />
          <Text
            color={'grey.200'}
            fontSize={'xs-10'}
            lineHeight={'xs-10'}
            fontWeight={'500'}
          >
            {'LIBRARY'}
          </Text>

          <Tooltip
            label={'Metrics'}
            aria-label={'Metrics'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Metrics"
              icon={
                <i
                  className={
                    isPageActive('metric')
                      ? 'ri-funds-box-fill'
                      : 'ri-funds-box-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('metric') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/metric/list/[dsId]')}
            />
          </Tooltip>
          <Tooltip
            label={'Funnels'}
            aria-label={'Funnels'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Funnels"
              icon={
                <i
                  className={
                    isPageActive('funnel') ? 'ri-filter-fill' : 'ri-filter-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('funnel') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/funnel/list/[dsId]')}
            />
          </Tooltip>
          <Tooltip
            label={'Segments'}
            aria-label={'Segments'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Segments"
              icon={
                <i
                  className={
                    isPageActive('segment')
                      ? 'ri-scissors-cut-fill'
                      : 'ri-scissors-cut-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('segment') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/segment/list/[dsId]')}
            />
          </Tooltip>
          <Tooltip
            label={'Retention'}
            aria-label={'Retention'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Retention"
              icon={
                <i
                  className={
                    isPageActive('retention')
                      ? 'ri-bar-chart-horizontal-fill'
                      : 'ri-bar-chart-horizontal-fill'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('retention') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() =>
                handleRedirect('/analytics/retention/create/[dsId]')
              }
            />
          </Tooltip>
          <Divider borderColor={'black.50'} opacity={'0.3'} />
          <Text
            color={'grey.200'}
            fontSize={'xs-10'}
            lineHeight={'xs-10'}
            fontWeight={'500'}
          >
            {'DATA'}
          </Text>
          <Tooltip
            label={'Source'}
            aria-label={'Source'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Data"
              icon={
                <i
                  className={
                    isPageActive('data/source')
                      ? 'ri-database-fill'
                      : 'ri-database-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('data/source') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/data/source/[dsId]')}
            />
          </Tooltip>

          <Tooltip
            label={'Data Stream'}
            aria-label={'Data Stream'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Data Stream"
              icon={
                <i
                  className={
                    isPageActive('data/stream')
                      ? 'ri-newspaper-fill'
                      : 'ri-newspaper-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('data/stream') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/data/stream/[dsId]')}
            />
          </Tooltip>

          <Tooltip
            label={'Data Management'}
            aria-label={'Data Management'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Data Management"
              icon={
                <i
                  className={
                    isPageActive('action')
                      ? 'ri-file-edit-fill'
                      : 'ri-file-edit-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('action') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/action/list/[dsId]')}
            />
          </Tooltip>
        </Flex>

        <Flex gap={'2'} direction={'column'}>
          <Tooltip
            label={'Settings'}
            aria-label={'Settings'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="settings"
              icon={
                <i
                  className={
                    isPageActive('settings')
                      ? 'ri-settings-3-fill'
                      : 'ri-settings-3-line'
                  }
                />
              }
              rounded={'lg'}
              h={10}
              w={10}
              bg={isPageActive('settings') ? 'black.50' : 'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => handleRedirect('/analytics/settings')}
            />
          </Tooltip>
          <Tooltip
            label={'Logout'}
            aria-label={'Logout'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
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
              onClick={openLogoutModal}
            />
          </Tooltip>
        </Flex>
      </Flex>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
    </Flex>
  );
};

export default DesktopSideMenu;
