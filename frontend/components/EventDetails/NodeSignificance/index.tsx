import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { formatDatalabel, getPercentageOfHits } from '@lib/utils/common';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import Alert from '@components/Alerts';
import BellIcon from '@assets/icons/bell-icon.svg';
import Image from 'next/image';

const NodeSignificance = ({
  eventData,
}: {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
}) => {
  const { nodeSignificanceData, trendsData } = eventData;
  const {
    isOpen: isAlertsSheetOpen,
    onOpen: openAlertsSheet,
    onClose: closeAlertsSheet,
  } = useDisclosure();
  return (
    <>
      <Box h={'auto'} minHeight={'18'} pt={'6'} pb={'7'}>
        <Text fontWeight={'medium'} fontSize={'base'} lineHeight={'base'}>
          {(nodeSignificanceData?.[0] as NodeSignificanceData)?.['node']}
        </Text>
      </Box>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
      <Box minH={'25'} py={'6'}>
        {nodeSignificanceData?.length ? (
          <Flex direction={'column'} gap={'1'}>
            <Flex alignItems={'baseline'}>
              <Text
                fontWeight={'bold'}
                fontSize={'sh-28'}
                lineHeight={'sh-28'}
                fontFamily={'Space Grotesk, Work Sans, sans-serif'}
              >
                {formatDatalabel(
                  (nodeSignificanceData?.[0] as NodeSignificanceData)?.[
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
            <Text fontWeight={'normal'} fontSize={'xs-12'} lineHeight={'xs-12'}>
              {`${getPercentageOfHits(
                (nodeSignificanceData?.[0] as NodeSignificanceData)?.[
                  'nodeHits'
                ],
                (nodeSignificanceData?.[0] as NodeSignificanceData)?.[
                  'totalHits'
                ]
              )}% of overall traffic`}
            </Text>
          </Flex>
        ) : null}
        <Box mt={'4'}>
          <Button
            bg={'white.100'}
            borderRadius={'25'}
            px={'3'}
            py={'2'}
            onClick={openAlertsSheet}
          >
            <Flex gap={'1'} alignItems={'center'} justifyContent={'center'}>
              <Image src={BellIcon} alt={'bell-icon'} />
              <Text
                color={'black.100'}
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'medium'}
              >
                {'Set Alert'}
              </Text>
            </Flex>
          </Button>
        </Box>
      </Box>
      <Alert
        eventData={eventData}
        isAlertsSheetOpen={isAlertsSheetOpen}
        closeAlertsSheet={closeAlertsSheet}
      />
    </>
  );
};

export default NodeSignificance;
