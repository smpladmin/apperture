import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { AppWithIntegrations } from '@lib/domain/app';
import AppsModal from '@components/Sidebar/AppsModal';
import { useRouter } from 'next/router';
import ConfigureAppsModal from '@components/ConfigureAppsModal';

export default function Layout({ children, apps = [] }: LayoutProps) {
  const router = useRouter();
  const [selectedAppId, setSelectedAppId] = useState(apps[0]._id);
  const [selectedApp, setSelectedApp] = useState(apps[0]);
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
    setSelectedApp(apps.find((a) => a._id === selectedAppId)!!);
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

  return (
    <Flex flexDir={'row'}>
      <AppsModal
        isOpen={isOpen}
        onClose={() => onModalClose('apps')}
        apps={apps}
        selectApp={setSelectedAppId}
        selectedApp={selectedApp}
        openConfigureAppsModal={() => onModalOpen('configure')}
      />
      <ConfigureAppsModal
        isConfigureAppsModalOpen={isConfigureAppsModalOpen}
        closeConfigureAppsModal={() => onModalClose('configure')}
        app={selectedApp}
      />
      <Sidebar
        selectedApp={selectedApp}
        openAppsModal={() => onModalOpen('apps')}
      />
      <Flex flexDir={'column'} w={'full'}>
        <Header selectedApp={selectedApp} openAppsModal={onModalOpen} />
        <Box as="main" h={'full'}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

type LayoutProps = {
  children: ReactNode;
  apps: AppWithIntegrations[];
};
