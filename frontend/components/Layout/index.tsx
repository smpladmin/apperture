import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { AppWithIntegrations } from '@lib/domain/app';
import AppsModal from '@components/Sidebar/AppsModal';
import { useRouter } from 'next/router';
import ConfigureAppsModal from '@components/ConfigureAppsModal';

export default function Layout({
  children,
  apps = [],
  hideHeader = false,
}: LayoutProps) {
  const router = useRouter();
  const defaultAppId = apps
    ?.flatMap((app) =>
      app?.integrations.flatMap((integration) => integration.datasources)
    )
    .find((app) => app?._id === router.query.dsId)?.appId;

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
    setSelectedApp(apps.find((a) => a?._id === selectedAppId)!!);
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
    <>
      <Flex flexDir={'row'}>
        <Sidebar
          selectedApp={selectedApp}
          openAppsModal={() => onModalOpen('apps')}
        />
        <Flex flexDir={'column'} w={'full'} overflow={'auto'}>
          {!hideHeader ? (
            <Header selectedApp={selectedApp} openAppsModal={onModalOpen} />
          ) : null}
          <Box as="main" h={'full'} overflowY={'auto'}>
            {children}
          </Box>
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
    </>
  );
}

type LayoutProps = {
  children: ReactNode;
  apps: AppWithIntegrations[];
  hideHeader?: boolean;
};
