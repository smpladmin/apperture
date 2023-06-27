import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import HomeNav from '@components/Home/components/HomeNav';
import Table from '@components/Home/Table';
import { AppWithIntegrations } from '@lib/domain/app';
import ExploreSection from '@components/Home/components/ExploreSection';

type HomeNavProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const Home = () => {
  return (
    <>
      <Box>
        <HomeNav />
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          p={5}
          bg={'grey.1000'}
        >
          <Box maxW={336} w={'full'}>
            <Text fontWeight={700} fontSize={'base'} lineHeight={'base'}>
              Start Exploring
            </Text>
            <ExploreSection />
          </Box>
        </Flex>
        <Box paddingX={5}>
          <Table />
        </Box>
      </Box>
    </>
  );
};

export default Home;
