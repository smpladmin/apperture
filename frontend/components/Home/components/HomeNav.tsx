import {
  Avatar,
  Flex,
  Image,
  Box,
  Link,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import { GearSix, Database, Stack } from '@phosphor-icons/react';
import { WHITE_DEFAULT } from '@theme/index';
import clickStream from '@assets/images/clickstream.svg';
import { AppWithIntegrations } from '@lib/domain/app';
import { useRouter } from 'next/router';
import AppsModal from '@components/Sidebar/AppsModal';
import ConfigureAppsModal from '@components/ConfigureAppsModal';
import { getAppId } from '../util';

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
    >
      <Image src={logo.src} color={'white'}></Image>
      <Flex color={WHITE_DEFAULT} gap={5} alignItems={'center'}>
        <Link padding={'6px'}>
          <Database size={20} />
        </Link>
        <Link padding={'6px'} href="/analytics/data/source/">
          <Stack size={20} />
        </Link>
        <Link padding={'6px'}>
          <Image src={clickStream.src} alt="Clickstream"></Image>
        </Link>
        <Link padding={'6px'} href="/analytics/settings">
          <GearSix size={20} />
        </Link>
        <Flex onClick={() => onModalOpen('apps')}>
          <Avatar
            name={'selectedApp.name'}
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
    </Flex>
  );
};

export default HomeNav;
