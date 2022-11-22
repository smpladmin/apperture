import { Box, Flex, Text } from '@chakra-ui/react';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { FunnelData, FunnelTrendsData } from '@lib/domain/funnel';
import React from 'react';
import FunnelChart from '../components/FunnelChart';
import Trend from '../components/Trend';

const RightView = ({
  computedFunnel,
  computedTrendsData,
}: {
  computedFunnel: FunnelData[];
  computedTrendsData: FunnelTrendsData[];
}) => {
  return (
    <ViewPanel>
      <Flex
        direction={'column'}
        gap={'8'}
        px={{ base: '0', md: '30' }}
        pt={{ base: '8', md: '4' }}
      >
        <Flex
          px={{ base: '0', md: '4' }}
          pt={{ base: '8', md: '8' }}
          direction={'column'}
          gap={'8'}
        >
          <Text
            fontSize={{ base: 'sh-18', md: 'sh-20' }}
            lineHeight={{ base: 'sh-18', md: 'sh-20' }}
            fontWeight={'semibold'}
          >
            Funnel
          </Text>
          <FunnelChart data={computedFunnel} />
        </Flex>
        <Flex
          px={{ base: '0', md: '4' }}
          pt={{ base: '8', md: '8' }}
          direction={'column'}
          gap={'8'}
        >
          <Text
            fontSize={{ base: 'sh-18', md: 'sh-20' }}
            lineHeight={{ base: 'sh-18', md: 'sh-20' }}
            fontWeight={'semibold'}
          >
            Trend
          </Text>
          <Trend data={computedTrendsData} />
        </Flex>
      </Flex>
    </ViewPanel>
  );
};

export default RightView;
