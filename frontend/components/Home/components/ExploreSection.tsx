import { Flex } from '@chakra-ui/react';
import React from 'react';
import sheets from '@assets/images/Sheets.svg';
import metrics from '@assets/images/Metrics.svg';
import funnels from '@assets/images/Funnels.svg';
import retentions from '@assets/images/Retention.svg';
import segments from '@assets/images/Segments.svg';
import pivots from '@assets/images/Pivot.svg';
import Homecard from '@components/Home/components/Card';
import { useRouter } from 'next/router';

const ExploreSection = ({
  appId,
  hasEventTrackingProvider,
}: {
  appId: string;
  hasEventTrackingProvider: boolean;
}) => {
  const router = useRouter();
  const { dsId } = router.query;
  return (
    <Flex mt={5} justifyContent={'space-between'}>
      <Homecard
        appId={appId}
        icon={sheets}
        text={'Sheets'}
        url={`/analytics/workbook/create/${dsId}`}
      />
      <Homecard
        appId={appId}
        icon={metrics}
        text={'Metrics'}
        url={`/analytics/metric/create/${dsId}`}
        disable={!hasEventTrackingProvider}
      />

      <Homecard
        appId={appId}
        icon={funnels}
        text={'Funnels'}
        url={`/analytics/funnel/create/${dsId}`}
        disable={!hasEventTrackingProvider}
      />
      <Homecard
        appId={appId}
        icon={retentions}
        text={'Retention'}
        url={`/analytics/retention/create/${dsId}`}
        disable={!hasEventTrackingProvider}
      />
      <Homecard
        appId={appId}
        icon={segments}
        text={'Segments'}
        url={`/analytics/segment/create/${dsId}`}
        disable={!hasEventTrackingProvider}
      />
      <Flex pointerEvents={'none'} opacity={'.4'}>
        <Homecard appId={appId} icon={pivots} text={'Pivot'} url={`#`} />
      </Flex>
    </Flex>
  );
};

export default ExploreSection;
