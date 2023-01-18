import {
  Button,
  Flex,
  Text,
  Highlight,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import {
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
  FunnelEventConversion,
} from '@lib/domain/funnel';
import { getConversionData } from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import FunnelChart from '../components/FunnelChart';
import Trend from '../components/Trend';
import UserConversionDrawer from '../components/UserCoversionDrawer';

const RightView = ({
  computedFunnel,
  computedTrendsData,
  datasourceId,
}: {
  computedFunnel: FunnelData[];
  computedTrendsData: FunnelTrendsData[];
  datasourceId: string;
}) => {
  const router = useRouter();
  const { dsId } = router.query;
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const [conversionData, setConversionData] =
    useState<FunnelEventConversion | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const funnelConversion =
    computedFunnel?.[computedFunnel?.length - 1]?.['conversion'];
  const funnelLastStepUsers =
    computedFunnel?.[computedFunnel?.length - 1]?.['users'];
  const handleChartClick = async (properties: any) => {
    onDrawerOpen();
    const { data } = properties.data;
    const { step, event } = data;
    setSelectedEvent(event.trim());

    const selectedSteps = computedFunnel
      .slice(0, step)
      .map((step): FunnelStep => {
        return { event: step.event, filters: [] };
      });
    const conversionAnalysisData: FunnelEventConversion =
      await getConversionData(datasourceId as string, selectedSteps);
    setConversionData({
      converted: conversionAnalysisData.converted,
      dropped: conversionAnalysisData.dropped,
      step,
      event: event.trim(),
    });
  };
  return (
    <ViewPanel>
      <Flex
        direction={'column'}
        gap={'8'}
        px={{ base: '0', md: '15' }}
        py={{ base: '8', md: '12' }}
      >
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Flex direction={'column'} gap={'1'}>
            <Text fontSize={'sh-18'} lineHeight={'sh-18'} fontWeight={'500'}>
              <Highlight
                query={`${funnelConversion}%`}
                styles={{ fontSize: 'sh-28', fontWeight: 700 }}
              >
                {`${funnelConversion}% Conversion`}
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
          {computedFunnel?.length ? (
            <FunnelChart
              data={computedFunnel}
              handleChartClick={handleChartClick}
            />
          ) : null}
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
          {computedTrendsData?.length ? (
            <Trend data={computedTrendsData} />
          ) : null}
        </Flex>
      </Flex>
      <UserConversionDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        conversionData={conversionData}
        datasourceId={datasourceId}
        event={selectedEvent as string}
      />
    </ViewPanel>
  );
};

export default RightView;
