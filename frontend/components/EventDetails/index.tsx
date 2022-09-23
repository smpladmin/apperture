import { Item } from '@antv/g6';
import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { TrendData, SankeyData } from '@lib/domain/eventData';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { useRef } from 'react';
import Sankey from './Sankey';
import Trend from './Trend';

type EventDetailsDrawer = {
  isEventDetailsDrawerOpen: boolean;
  closeEventDetailsDrawer: () => void;
  setSelectedNode: Function;
  selectedNode: Item | null;
  eventData: { [key in string]: Array<TrendData | SankeyData> };
};

const EventDetails = ({
  isEventDetailsDrawerOpen,
  closeEventDetailsDrawer,
  setSelectedNode,
  selectedNode,
  eventData,
}: EventDetailsDrawer) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    closeEventDetailsDrawer();
    setSelectedNode(null);
  };

  useOnClickOutside(drawerRef, handleClickOutside);
  const { trendsData, sankeyData } = eventData;

  return (
    <>
      {isEventDetailsDrawerOpen && trendsData.length && sankeyData.length ? (
        <>
          <Box
            ref={drawerRef}
            position={'fixed'}
            zIndex={'200'}
            mt={'0.15'}
            width={'106'}
            h={'full'}
            px={'7'}
            pt={'2'}
            backgroundColor={'white.DEFAULT'}
            shadow={'1px 1px 0 rgba(30, 25, 34, 0.08)'}
            overflowY={'auto'}
            animation={'ease-out 1s'}
          >
            <Flex direction={'column'}>
              <Box h={'18'} pt={'6'} pb={'7'}>
                <Text
                  fontWeight={'medium'}
                  fontSize={'base'}
                  lineHeight={'base'}
                >
                  {selectedNode?._cfg?.id}
                </Text>
              </Box>
              <Divider
                orientation="horizontal"
                borderColor={'white.200'}
                opacity={1}
              />
              <Box h={'25'} py={'6'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
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
                      <Text
                        fontWeight={'medium'}
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                      >
                        &nbsp;Hits
                      </Text>
                    </Flex>
                    <Text
                      fontWeight={'normal'}
                      fontSize={'xs-12'}
                      lineHeight={'xs-12'}
                    >
                      {'2.1% of overall traffic'}
                    </Text>
                  </Flex>
                  <Text
                    fontWeight={'semi-bold'}
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                  >
                    11%
                  </Text>
                </Flex>
              </Box>
              <Divider
                orientation="horizontal"
                borderColor={'white.200'}
                opacity={1}
              />
              <Trend trendsData={trendsData as Array<TrendData>} />
              <Divider
                orientation="horizontal"
                borderColor={'white.200'}
                opacity={1}
              />
              <Sankey sankeyData={sankeyData as Array<SankeyData>} />
            </Flex>
          </Box>
          <Box position={'fixed'} zIndex={'100'} w={'full'} h={'full'} />
        </>
      ) : null}
    </>
  );
};

export default EventDetails;
