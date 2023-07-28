import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ExploreSection from './components/ExploreSection';
import { AppWithIntegrations } from '@lib/domain/app';
import ListingTable from './components/Table';
import { AppertureUser } from '@lib/domain/user';
import { getAppertureUserInfo } from '@lib/services/userService';
import { useRouter } from 'next/router';
import {
  getAllDatasourceProvidersFromApp,
  getAppFromDataSourceId,
} from '@lib/utils/common';

const EventTrackingProviders = [
  'mixpanel',
  'clevertap',
  'apperture',
  'amplitude',
];

const Home = ({ apps }: { apps: AppWithIntegrations[] }) => {
  useEffect(() => {
    const identifyUser = async () => {
      const user: AppertureUser = await getAppertureUserInfo();
      window?.posthog?.identify?.(user.id);
    };
    identifyUser();
  }, []);

  const router = useRouter();
  const { dsId } = router.query;

  const [appId, setAppId] = useState<string>('');
  useEffect(() => {
    const app = getAppFromDataSourceId(apps, dsId as string);
    setAppId(app ? app._id : apps[0]._id);
  }, [dsId]);

  const hasCurrentSelectedAppEventTrackingProviders = () => {
    const currentApp = getAppFromDataSourceId(apps, dsId as string);
    if (currentApp) {
      const datasourceProvidersInApp =
        getAllDatasourceProvidersFromApp(currentApp);

      return datasourceProvidersInApp.some((provider) =>
        EventTrackingProviders.includes(provider)
      );
    }
    return false;
  };

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
          <ExploreSection
            appId={appId}
            hasEventTrackingProvider={hasCurrentSelectedAppEventTrackingProviders()}
          />
        </Box>
      </Flex>
      <Box paddingX={5} h={'full'}>
        <ListingTable apps={apps} />
      </Box>
    </Box>
  );
};

export default Home;
