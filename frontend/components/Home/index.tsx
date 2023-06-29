import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import ExploreSection from './components/ExploreSection';
import { AppWithIntegrations } from '@lib/domain/app';
import ListingTable from './components/Table';
import { AppertureUser } from '@lib/domain/user';
import { getAppertureUserInfo } from '@lib/services/userService';

const Home = ({ apps }: { apps: AppWithIntegrations[] }) => {
  useEffect(() => {
    const identifyUser = async () => {
      const user: AppertureUser = await getAppertureUserInfo();
      window?.posthog?.identify?.(user.id);
    };
    identifyUser();
  }, []);

  return (
    <Box h={'full'}>
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
      <Box paddingX={5} h={'full'}>
        <ListingTable apps={apps} />
      </Box>
    </Box>
  );
};

export default Home;
