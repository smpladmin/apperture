import { Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';

export default function Layout({ children, isMobile = false }: LayoutProps) {
  return (
    <Flex flexDir={'row'}>
      <Sidebar isMobile={isMobile} />
      <Flex flexDir={'column'} w={'full'}>
        <Header isMobile={isMobile} />
        <main>{children}</main>
      </Flex>
    </Flex>
  );
}

type LayoutProps = {
  children: ReactNode;
  isMobile: boolean;
};
