import { Box, Divider, Flex, Skeleton, Text } from '@chakra-ui/react';
import {
  TrendData,
  SankeyData,
  NodeSignificanceData,
} from '@lib/domain/eventData';
import Sankey from './Sankey';
import Trend from './Trend';
import { formatDatalabel, getPercentageOfHits } from '@lib/utils/graph';
import { useEffect, useState } from 'react';

type EventDetailsInfo = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
};

const EventDetailsInfo = ({ eventData }: EventDetailsInfo) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (Object.keys(eventData).length) {
      setIsLoading(false);
    }
  }, [eventData]);

  const { nodeSignificanceData, trendsData, sankeyData } = eventData;

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
        <Flex direction={'column'}>
          <Box h={'auto'} minHeight={'18'} pt={'6'} pb={'7'}>
            <Text fontWeight={'medium'} fontSize={'base'} lineHeight={'base'}>
              {(nodeSignificanceData[0] as NodeSignificanceData)?.['node']}
            </Text>
          </Box>
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          <Box h={'25'} py={'6'}>
            {nodeSignificanceData.length ? (
              <Flex direction={'column'} gap={'1'}>
                <Flex alignItems={'baseline'}>
                  <Text
                    fontWeight={'bold'}
                    fontSize={'sh-28'}
                    lineHeight={'sh-28'}
                    fontFamily={'Space Grotesk, Work Sans, sans-serif'}
                  >
                    {formatDatalabel(
                      (nodeSignificanceData[0] as NodeSignificanceData)?.[
                        'nodeHits'
                      ]
                    )}
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
                  {`${getPercentageOfHits(
                    (nodeSignificanceData[0] as NodeSignificanceData)?.[
                      'nodeHits'
                    ],
                    (nodeSignificanceData[0] as NodeSignificanceData)?.[
                      'totalHits'
                    ]
                  )}% of overall traffic`}
                </Text>
              </Flex>
            ) : null}
          </Box>
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
