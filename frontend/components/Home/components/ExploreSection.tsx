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

const ExploreSection = () => {
  const router = useRouter();
  const { dsId } = router.query;
  return (
    <Flex mt={5} justifyContent={'space-between'}>
      <Homecard
        icon={sheets.src}
        text={'Sheets'}
        url={`/analytics/workbook/create/${dsId}`}
      />
      <Homecard
        icon={metrics.src}
        text={'Metrics'}
        url={`/analytics/metric/create/${dsId}`}
      />

      <Homecard
        icon={funnels.src}
        text={'Funnels'}
        url={`/analytics/funnel/create/${dsId}`}
      />
      <Homecard
        icon={retentions.src}
        text={'Retention'}
        url={`/analytics/retention/create/${dsId}`}
      />
      <Homecard
        icon={segments.src}
        text={'Segments'}
        url={`/analytics/segment/create/${dsId}`}
      />
      <Flex pointerEvents={'none'} opacity={'.4'}>
        <Homecard icon={pivots.src} text={'Pivot'} url={`#`} />
      </Flex>
    </Flex>
  );
};

export default ExploreSection;
