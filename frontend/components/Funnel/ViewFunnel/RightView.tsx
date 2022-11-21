import { Flex, Text } from '@chakra-ui/react';
import RightPanel from '@components/EventsLayout/RightPanel';
import { FunnelData } from '@lib/domain/funnel';
import React from 'react';
import FunnelChart from '../components/FunnelChart';

const RightView = ({ computedFunnel }: { computedFunnel: FunnelData[] }) => {
  return (
    <RightPanel>
      <Flex
        direction={'column'}
        gap={'8'}
        px={{ base: '0', md: '30' }}
        py={{ base: '8', md: '8' }}
      >
        <Text
          fontSize={{ base: 'sh-18', md: 'sh-20' }}
          lineHeight={{ base: 'sh-18', md: 'sh-20' }}
          fontWeight={{ base: 'medium', md: 'semibold' }}
        >
          Funnel
        </Text>
        {computedFunnel?.length ? <FunnelChart data={computedFunnel} /> : null}
      </Flex>
    </RightPanel>
  );
};

export default RightView;
