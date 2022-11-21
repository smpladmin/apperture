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
        px={{ base: '4', md: '30' }}
        py={{ base: '8', md: '30' }}
      >
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'semibold'}>
          Funnel
        </Text>
        {computedFunnel?.length ? <FunnelChart data={computedFunnel} /> : null}
      </Flex>
    </RightPanel>
  );
};

export default RightView;
