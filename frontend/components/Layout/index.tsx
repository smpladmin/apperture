import { Flex, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { App } from '@lib/domain/app';
import AppsModal from '@components/Sidebar/AppsModal';

export default function Layout({ children, apps = [] }: LayoutProps) {
  const [selectedAppId, setSelectedAppId] = useState(apps[0]._id);
  const [selectedApp, setSelectedApp] = useState(apps[0]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setSelectedApp(apps.find((a) => a._id === selectedAppId)!!);
  }, [apps, selectedAppId]);

  return (
    <Flex flexDir={'row'}>
      <AppsModal
        isOpen={isOpen}
        onClose={onClose}
        apps={apps}
        selectApp={setSelectedAppId}
        selectedApp={selectedApp}
      />
      <Sidebar selectedApp={selectedApp} openAppsModal={onOpen} />
      <Flex flexDir={'column'} w={'full'}>
        <Header apps={apps} />
        <main>{children}</main>
      </Flex>
    </Flex>
  );
}

type LayoutProps = {
  children: ReactNode;
  apps: App[];
};
