import { Box, Flex } from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import React, { ReactNode } from 'react';
import HomeNav from './HomeNav';

type HomeLayoutProps = {
  children: ReactNode;
  apps: AppWithIntegrations[];
};

const HomeLayout = ({ children, apps = [] }: HomeLayoutProps) => {
  return (
    <Flex direction={'column'}>
      <HomeNav apps={apps} />
      <Box as="main" h={'full'} overflowY={'auto'}>
        {children}
      </Box>
    </Flex>
  );
};

export default HomeLayout;
