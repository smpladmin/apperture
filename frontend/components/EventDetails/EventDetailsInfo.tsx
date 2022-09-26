import { Item } from '@antv/g6';
import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { TrendData, SankeyData } from '@lib/domain/eventData';
import Sankey from './Sankey';
import Trend from './Trend';

type EventDetailsInfo = {
  selectedNode: Item | null;
  eventData: { [key in string]: Array<TrendData | SankeyData> };
};

const EventDetailsInfo = ({ eventData, selectedNode }: EventDetailsInfo) => {
  const { trendsData, sankeyData } = eventData;
  return (
    <Flex direction={'column'}>
      <Box h={'18'} pt={'6'} pb={'7'}>
        <Text fontWeight={'medium'} fontSize={'base'} lineHeight={'base'}>
          {selectedNode?._cfg?.id}
        </Text>
      </Box>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
      <Box h={'25'} py={'6'}>
        <Flex direction={'column'} gap={'1'}>
          <Flex alignItems={'baseline'}>
            <Text
              fontWeight={'bold'}
              fontSize={'sh-28'}
              lineHeight={'sh-28'}
              fontFamily={'Space Grotesk, Work Sans, sans-serif'}
            >
              {'6.1 k'}
            </Text>
            <Text fontWeight={'medium'} fontSize={'xs-14'} lineHeight={'xs-14'}>
              &nbsp;Hits
            </Text>
          </Flex>
          <Text fontWeight={'normal'} fontSize={'xs-12'} lineHeight={'xs-12'}>
            {'2.1% of overall traffic'}
          </Text>
        </Flex>
      </Box>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
      {trendsData.length ? (
        <Trend trendsData={trendsData as Array<TrendData>} />
      ) : null}
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
      {sankeyData.length ? (
        <Sankey sankeyData={sankeyData as Array<SankeyData>} />
      ) : null}
    </Flex>
  );
};

export default EventDetailsInfo;
