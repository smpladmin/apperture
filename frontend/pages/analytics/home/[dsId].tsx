import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import sheets from '@assets/images/Sheets.svg';
import metrics from '@assets/images/Metrics.svg';
import funnels from '@assets/images/Funnels.svg';
import retentions from '@assets/images/Retention.svg';
import segments from '@assets/images/Segments.svg';
import pivots from '@assets/images/Pivot.svg';
import Homecard from '@components/Home/Card';
import HomeNav from '@components/Home/HomeNav';
import Table from '@components/Home/Table';
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
            <Flex mt={5} justifyContent={'space-between'}>
              <Homecard
                icon={sheets.src}
                text={'Sheets'}
                create={'www.google.com'}
              />
              <Homecard
                icon={metrics.src}
                text={'Metrics'}
                create={`/analytics/metric/create/`}
              />

              <Homecard
                icon={funnels.src}
                text={'Funnels'}
                create={`http://localhost:3000/analytics/metric/create/`}
              />
              <Homecard
                icon={retentions.src}
                text={'Retention'}
                create={`http://localhost:3000/analytics/metric/create/`}
              />
              <Homecard
                icon={segments.src}
                text={'Segments'}
                create={`http://localhost:3000/analytics/metric/create/`}
              />
              <Flex pointerEvents={'none'} opacity={'.5'}>
                <Homecard icon={pivots.src} text={'Pivot'} create={`#`} />
              </Flex>
            </Flex>
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
