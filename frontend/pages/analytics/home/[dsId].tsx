import { Box, Flex, Text } from '@chakra-ui/react';
import React, { ReactElement, useEffect } from 'react';
import ExploreSection from '@components/Home/components/ExploreSection';
import { AppertureUser } from '@lib/domain/user';
import { getAppertureUserInfo } from '@lib/services/userService';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { AppWithIntegrations } from '@lib/domain/app';
import ListingTable from '@components/Home/components/Table/Table';
import HomeLayout from '@components/HomeLayout';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const token = getAuthToken(req);
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getAppsWithIntegrations(token);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  return {
    props: { apps },
  };
};

const Home = ({ apps }: { apps: AppWithIntegrations[] }) => {
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
          <ListingTable apps={apps} />
        </Box>
      </Box>
    </>
  );
};

Home.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default Home;
