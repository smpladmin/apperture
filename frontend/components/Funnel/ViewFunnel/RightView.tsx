import { Button, Flex, Text, Highlight, Divider } from '@chakra-ui/react';
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
  const funnelConversion =
    computedTrendsData?.[computedTrendsData.length - 1]?.['conversion'];
  const funnelLastStepUsers =
    computedTrendsData?.[computedTrendsData.length - 1]?.['lastStepUsers'];

  return (
    <ViewPanel>
      <Flex
        direction={'column'}
        gap={'8'}
        px={{ base: '0', md: '25' }}
        py={{ base: '8', md: '12' }}
      >
        <Flex justifyContent={'space-between'}>
          <Flex direction={'column'} gap={'1'}>
            <Text fontSize={'sh-18'} lineHeight={'sh-18'} fontWeight={'500'}>
              <Highlight
                query={`${funnelConversion}%`}
                styles={{ fontSize: 'sh-28', fontWeight: 700 }}
              >
                {`${funnelConversion}% Conversion last week`}
              </Highlight>
            </Text>
            <Text
              fontSize={'base'}
              lineHeight={'base'}
              fontWeight={'400'}
              color={'grey.100'}
            >
              {`${funnelLastStepUsers} users`}
            </Text>
          </Flex>
          <Button
            h={'15'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'600'}
            bg={'white.200'}
          >
            {'Analyse Factors'}
          </Button>
        </Flex>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <Flex direction={'column'} gap={'8'}>
          <Text
            fontSize={{ base: 'sh-18', md: 'sh-20' }}
            lineHeight={{ base: 'sh-18', md: 'sh-20' }}
            fontWeight={'semibold'}
          >
            Funnel
          </Text>
          {computedFunnel.length ? <FunnelChart data={computedFunnel} /> : null}
        </Flex>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <Flex direction={'column'} gap={'8'}>
          <Text
            fontSize={{ base: 'sh-18', md: 'sh-20' }}
            lineHeight={{ base: 'sh-18', md: 'sh-20' }}
            fontWeight={'semibold'}
          >
            Trend
          </Text>
          {computedTrendsData.length ? (
            <Trend data={computedTrendsData} />
          ) : null}
        </Flex>
      </Flex>
    </ViewPanel>
  );
};

export default RightView;
