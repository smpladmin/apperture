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

export const BellIcon = () => {
  return (
    <svg
      width="12"
      height="15"
      viewBox="0 0 12 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.3333 11.4447L11.5999 11.8C11.6371 11.8495 11.6597 11.9084 11.6652 11.9701C11.6708 12.0317 11.6591 12.0937 11.6314 12.1491C11.6037 12.2044 11.5612 12.251 11.5085 12.2835C11.4558 12.3161 11.3952 12.3333 11.3333 12.3333H0.666585C0.604681 12.3333 0.544 12.3161 0.491342 12.2835C0.438683 12.251 0.396127 12.2044 0.368443 12.1491C0.340759 12.0937 0.32904 12.0317 0.334599 11.9701C0.340158 11.9084 0.362776 11.8495 0.399919 11.8L0.666585 11.4447V5.66666C0.666585 4.25217 1.22849 2.89562 2.22868 1.89543C3.22888 0.895232 4.58543 0.333328 5.99992 0.333328C7.41441 0.333328 8.77096 0.895232 9.77115 1.89543C10.7713 2.89562 11.3333 4.25217 11.3333 5.66666V11.4447ZM4.33325 13H7.66658C7.66658 13.442 7.49099 13.8659 7.17843 14.1785C6.86587 14.4911 6.44195 14.6667 5.99992 14.6667C5.55789 14.6667 5.13397 14.4911 4.82141 14.1785C4.50885 13.8659 4.33325 13.442 4.33325 13V13Z"
        fill="#0E0E1A"
      />
    </svg>
  );
};

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
              <BellIcon />
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
