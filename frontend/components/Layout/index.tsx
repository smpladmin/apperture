import { Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { App } from '@lib/domain/app';

export default function Layout({ children, apps = [] }: LayoutProps) {
  console.log('layout', apps);
  return (
    <Flex flexDir={'row'}>
      <Sidebar apps={apps} />
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
