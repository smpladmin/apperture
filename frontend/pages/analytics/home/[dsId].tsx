import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import HomeNav from '@components/Home/components/HomeNav';
import Table from '@components/Home/Table';
import ExploreSection from '@components/Home/components/ExploreSection';
import { AppertureUser } from '@lib/domain/user';
import { getAppertureUserInfo } from '@lib/services/userService';

const Home = () => {
  useEffect(() => {
    const identifyUser = async () => {
      const user: AppertureUser = await getAppertureUserInfo();
      window?.posthog?.identify?.(user.id);
    };
    identifyUser();
  }, []);

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
