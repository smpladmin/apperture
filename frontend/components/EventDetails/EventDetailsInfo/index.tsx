import { Divider, Flex, Skeleton } from '@chakra-ui/react';
import { EventData } from '@lib/domain/eventData';
import Sankey from '../Sankey';
import Trend from '../Trend';
import { useEffect, useState } from 'react';
import NodeSignificance from '../NodeSignificance';

type EventDetailsInfoProps = {
  eventData: EventData | {};
  setClickOutsideEnabled?: Function;
};

const EventDetailsInfo = ({
  eventData,
  setClickOutsideEnabled,
}: EventDetailsInfoProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (Object.keys(eventData).length) {
      setIsLoading(false);
    }
  }, [eventData]);

  const { nodeSignificanceData, trendsData, sankeyData } =
    eventData as EventData;

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
          <NodeSignificance
            nodeSignificanceData={nodeSignificanceData}
            setClickOutsideEnabled={setClickOutsideEnabled}
          />
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          {trendsData.length ? <Trend trendsData={trendsData} /> : null}
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          {sankeyData.length ? <Sankey sankeyData={sankeyData} /> : null}
        </Flex>
      )}
    </>
  );
};

export default EventDetailsInfo;
