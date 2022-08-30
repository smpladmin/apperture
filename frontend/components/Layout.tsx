import { Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Flex flexDir={'row'}>
      <Sidebar />
      <Flex flexDir={'column'} w={'full'}>
        <Header />
        <main>{children}</main>
      </Flex>
    </Flex>
  );
}
