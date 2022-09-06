import { Flex, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { App } from '@lib/domain/app';
import AppsModal from '@components/Sidebar/AppsModal';
import { useRouter } from 'next/router';

export default function Layout({ children, apps = [] }: LayoutProps) {
  const router = useRouter();
  const [selectedAppId, setSelectedAppId] = useState(apps[0]._id);
  const [selectedApp, setSelectedApp] = useState(apps[0]);
  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: !!router.query.apps,
  });

  useEffect(() => {
    setSelectedApp(apps.find((a) => a._id === selectedAppId)!!);
  }, [apps, selectedAppId]);

  const onModalOpen = () => {
    onOpen();
    router.replace({ query: { ...router.query, apps: 1 } });
  };

  const onModalClose = () => {
    onClose();
    const query = router.query;
    delete query.apps;
    router.replace({ query: { ...query } });
  };

  return (
    <Flex flexDir={'row'}>
      <AppsModal
        isOpen={isOpen}
        onClose={onModalClose}
        apps={apps}
        selectApp={setSelectedAppId}
        selectedApp={selectedApp}
      />
      <Sidebar selectedApp={selectedApp} openAppsModal={onModalOpen} />
      <Flex flexDir={'column'} w={'full'}>
        <Header selectedApp={selectedApp} openAppsModal={onModalOpen} />
        <main style={{ height: '100%' }}>{children}</main>
      </Flex>
    </Flex>
  );
}

type LayoutProps = {
  children: ReactNode;
  apps: App[];
};
