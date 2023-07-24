import { Avatar, Flex, Image, Link, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import {
  GearSix,
  Database,
  Stack,
  SignOut,
  SquaresFour,
  HardDrives,
} from '@phosphor-icons/react';
import { GREY_600, WHITE_DEFAULT } from '@theme/index';
import clickstreamIcon from '@assets/images/clickstream.svg';
import { AppWithIntegrations } from '@lib/domain/app';
import { useRouter } from 'next/router';
import AppsModal from '@components/Sidebar/AppsModal';
import ConfigureAppsModal from '@components/ConfigureAppsModal';
import { getAppId } from '../Home/util';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { CaretRight } from 'phosphor-react';
import LogoutModal from '@components/Logout';

type HomeNavProps = {
  apps: AppWithIntegrations[];
};

const HomeNav = ({ apps }: HomeNavProps) => {
  const router = useRouter();
  const { dsId } = router.query;
  const defaultAppId = getAppId(apps, dsId as string);

  const [selectedAppId, setSelectedAppId] = useState(
    defaultAppId || apps[0]?._id
  );
  const [selectedApp, setSelectedApp] = useState(
    apps.find((a) => a?._id === defaultAppId) || apps?.[0]
  );

  const [hoveredItem, setIsHoveredItem] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: !!router.query.apps,
  });
  const {
    isOpen: isConfigureAppsModalOpen,
    onOpen: openConfigureAppsModal,
    onClose: closeConfigureAppsModal,
  } = useDisclosure({
    defaultIsOpen: !!router.query.configure,
  });

  const {
    isOpen: isLogoutModalOpen,
    onOpen: openLogoutModal,
    onClose: closeLogoutModal,
  } = useDisclosure();

  useEffect(() => {
    setSelectedApp(apps.find((a) => a?._id === selectedAppId) || apps[0]);
  }, [apps, selectedAppId]);

  const onModalOpen = (modalQuery: string) => {
    modalQuery === 'apps' ? onOpen() : openConfigureAppsModal();
    router.replace({ query: { ...router.query, [modalQuery]: 1 } });
  };

  const onModalClose = (modalQuery: string) => {
    modalQuery === 'apps' ? onClose() : closeConfigureAppsModal();

    const query = router.query;
    delete query[modalQuery];
    router.replace({ query: { ...query } });
  };

  const navigateToIntegrationSelect = (appId: string) => {
    router.push({
      pathname: '/analytics/app/[appId]/integration/select',
      query: { appId, add: true },
    });
  };

  const navigateToExploreDataSource = (dsId: string) => {
    router.push({
      pathname: '/analytics/home/[dsId]',
      query: { dsId },
    });
  };

  const onAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    onClose();
    const defaultDataSourceId = apps
      .find((app) => app._id === appId)
      ?.integrations.filter((integration) => integration.datasources.length)[0]
      ?.datasources[0]?._id;

    if (!defaultDataSourceId) {
      navigateToIntegrationSelect(appId);
    } else {
      navigateToExploreDataSource(defaultDataSourceId);
    }
  };

  return (
    <Flex
      justifyContent={'space-between'}
      alignItems={'center'}
      bg={'grey.900'}
      py={5}
      px={6}
      zIndex={'999'}
    >
      <Image
        src={logo.src}
        color={'white'}
        cursor={'pointer'}
        onClick={() => {
          router.push({
            pathname: `/analytics/home/[dsId]`,
            query: { dsId },
          });
        }}
      ></Image>
      <Flex color={WHITE_DEFAULT} gap={5} alignItems={'center'}>
        <Menu>
          <MenuButton
            _focus={{ bg: 'black.500' }}
            _expanded={{ bg: 'black.500' }}
            borderRadius={8}
            padding={'6px'}
          >
            <Database size={20} />
          </MenuButton>
          <MenuList padding={2} borderRadius={8}>
            <MenuItem
              padding={2}
              paddingY={3}
              borderRadius={8}
              _focus={{ bg: 'white.400' }}
              onClick={() => {
                router.push({
                  pathname: `/analytics/action/list/[dsId]`,
                  query: { dsId },
                });
              }}
              onMouseEnter={() => setIsHoveredItem('Data Management')}
              onMouseLeave={() => setIsHoveredItem('')}
            >
              <Flex
                justifyContent={'space-between'}
                flexDirection={'row'}
                alignItems={'center'}
                width={'full'}
              >
                <Flex
                  color={'black.500'}
                  gap={2}
                  fontWeight={'500'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  alignItems={'center'}
                >
                  <SquaresFour size={16} color={GREY_600} /> Data Management
                </Flex>
                {hoveredItem === 'Data Management' && (
                  <CaretRight size={16} color={GREY_600} />
                )}
              </Flex>
            </MenuItem>
            <MenuItem
              padding={2}
              paddingY={3}
              borderRadius={8}
              _focus={{ bg: 'white.400' }}
              onClick={() => {
                router.push({
                  pathname: `/analytics/data/source/[dsId]`,
                  query: { dsId },
                });
              }}
              onMouseEnter={() => setIsHoveredItem('Event Stream')}
              onMouseLeave={() => setIsHoveredItem('')}
            >
              <Flex
                justifyContent={'space-between'}
                flexDirection={'row'}
                alignItems={'center'}
                width={'full'}
              >
                <Flex
                  color={'black.500'}
                  gap={2}
                  fontWeight={'500'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  alignItems={'center'}
                >
                  <Stack size={16} color={GREY_600} /> Event Stream
                </Flex>
                {hoveredItem === 'Event Stream' && (
                  <CaretRight size={16} color={GREY_600} />
                )}
              </Flex>
            </MenuItem>
            <MenuItem
              padding={2}
              paddingY={3}
              borderRadius={8}
              _focus={{ bg: 'white.400' }}
              onClick={() => {
                router.push({
                  pathname: `/analytics/data/stream/[dsId]`,
                  query: { dsId },
                });
              }}
              onMouseEnter={() => setIsHoveredItem('Click Stream')}
              onMouseLeave={() => setIsHoveredItem('')}
            >
              <Flex
                justifyContent={'space-between'}
                flexDirection={'row'}
                alignItems={'center'}
                width={'full'}
              >
                <Flex
                  color={'black.500'}
                  gap={2}
                  fontWeight={'500'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  alignItems={'center'}
                >
                  <Image
                    src={clickstreamIcon.src}
                    alt={'clickstream'}
                    width={4}
                    height={4}
                  />
                  Click Stream
                </Flex>
                {hoveredItem === 'Click Stream' && (
                  <CaretRight size={16} color={GREY_600} />
                )}
              </Flex>
            </MenuItem>
            <MenuItem
              padding={2}
              paddingY={3}
              borderRadius={8}
              _focus={{ bg: 'white.400' }}
              onClick={() => {
                router.push({
                  pathname: `/analytics/datamart/list/[dsId]`,
                  query: { dsId },
                });
              }}
              onMouseEnter={() => setIsHoveredItem('Data Mart')}
              onMouseLeave={() => setIsHoveredItem('')}
            >
              <Flex
                justifyContent={'space-between'}
                flexDirection={'row'}
                alignItems={'center'}
                width={'full'}
              >
                <Flex
                  color={'black.500'}
                  gap={2}
                  fontWeight={'500'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  alignItems={'center'}
                >
                  <HardDrives size={16} color={GREY_600} /> My Data
                </Flex>
                {hoveredItem === 'Data Mart' && (
                  <CaretRight size={16} color={GREY_600} />
                )}
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton
            _focus={{ bg: 'black.500' }}
            _expanded={{ bg: 'black.500' }}
            borderRadius={8}
            padding={'6px'}
          >
            <GearSix size={20} />
          </MenuButton>
          <MenuList padding={2} borderRadius={8}>
            <MenuItem
              padding={2}
              paddingY={3}
              borderRadius={8}
              _focus={{ bg: 'white.400' }}
              onClick={() => {
                router.push({
                  pathname: `/analytics/settings/integrations`,
                  query: { dsId },
                });
              }}
              onMouseEnter={() => setIsHoveredItem('Integrations')}
              onMouseLeave={() => setIsHoveredItem('')}
            >
              <Flex
                justifyContent={'space-between'}
                flexDirection={'row'}
                alignItems={'center'}
                width={'full'}
                fontWeight={'500'}
              >
                <Flex
                  color={'black.500'}
                  gap={2}
                  fontWeight={'500'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  alignItems={'center'}
                >
                  <GearSix size={16} color={GREY_600} /> Integrations
                </Flex>
                {hoveredItem === 'Integrations' && (
                  <CaretRight size={16} color={GREY_600} />
                )}
              </Flex>
            </MenuItem>
            <MenuItem
              padding={2}
              paddingY={3}
              borderRadius={8}
              _focus={{ bg: 'white.400' }}
              onClick={openLogoutModal}
              onMouseEnter={() => setIsHoveredItem('Logout')}
              onMouseLeave={() => setIsHoveredItem('')}
            >
              <Flex
                justifyContent={'space-between'}
                flexDirection={'row'}
                alignItems={'center'}
                width={'full'}
              >
                <Flex
                  color={'black.500'}
                  gap={2}
                  fontWeight={'500'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  alignItems={'center'}
                >
                  <SignOut size={16} color={GREY_600} /> Logout
                </Flex>
                {hoveredItem === 'Logout' && (
                  <CaretRight size={16} color={GREY_600} />
                )}
              </Flex>
            </MenuItem>
          </MenuList>
        </Menu>
        <Flex onClick={() => onModalOpen('apps')}>
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
            borderRadius={8}
          />
        </Flex>
      </Flex>
      <AppsModal
        isOpen={isOpen}
        onAppSelect={onAppSelect}
        onClose={() => onModalClose('apps')}
        apps={apps}
        selectedApp={selectedApp}
        openConfigureAppsModal={() => onModalOpen('configure')}
      />
      <ConfigureAppsModal
        isConfigureAppsModalOpen={isConfigureAppsModalOpen}
        closeConfigureAppsModal={() => onModalClose('configure')}
        app={selectedApp}
      />
      <LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
    </Flex>
  );
};

export default HomeNav;
