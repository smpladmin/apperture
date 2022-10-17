import { Box, Divider, Flex, Skeleton, Text } from '@chakra-ui/react';
import {
  TrendData,
  SankeyData,
  NodeSignificanceData,
} from '@lib/domain/eventData';
import Sankey from './Sankey';
import Trend from './Trend';
import { useEffect, useState } from 'react';
import NodeSignificance from './NodeSignificance';

type EventDetailsInfoProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
};

const EventDetailsInfo = ({ eventData }: EventDetailsInfoProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (Object.keys(eventData).length) {
      setIsLoading(false);
    }
  }, [eventData]);

  const { trendsData, sankeyData } = eventData;

  return (
    <>
      {isLoading ? (
        <Flex direction={'column'} gap={'6'} pt={'4'}>
          <Skeleton height={'18'} fadeDuration={1} bg={'white.100'} />
          <Skeleton height={'20'} fadeDuration={1} bg={'white.100'} />
          <Skeleton height={'82'} fadeDuration={1} bg={'white.100'} />
          <Skeleton height={'168'} fadeDuration={1} bg={'white.100'} />
        </Flex>
      ) : (
        <Flex direction={'column'} overflowY={'auto'}>
          <NodeSignificance eventData={eventData} />
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          {trendsData.length ? (
            <Trend trendsData={trendsData as Array<TrendData>} />
          ) : null}
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          {sankeyData.length ? (
            <Sankey sankeyData={sankeyData as Array<SankeyData>} />
          ) : null}
        </Flex>
      )}
    </>
  );
};

export default EventDetailsInfo;
