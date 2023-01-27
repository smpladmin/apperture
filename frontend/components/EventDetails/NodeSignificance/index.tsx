import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { formatDatalabel, getPercentageOfHits } from '@lib/utils/common';
import { NodeSignificanceData, TrendData } from '@lib/domain/eventData';
import Alert from '@components/Alerts';
import BellIcon from '@assets/icons/bell-icon.svg';
import Image from 'next/image';
import { NotificationVariant } from '@lib/domain/notification';
import { useEffect, useState } from 'react';
import { getTrendsData } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';

type NodeSignificanceProps = {
  nodeSignificanceData: Array<NodeSignificanceData>;
  setClickOutsideEnabled?: Function;
};

const NodeSignificance = ({
  nodeSignificanceData,
  setClickOutsideEnabled,
}: NodeSignificanceProps) => {
  const router = useRouter();

  const { dsId } = router.query;

  const { isOpen: isAlertsSheetOpen, onOpen, onClose } = useDisclosure();
  const [dailyTrendData, setDailyTrendData] = useState<TrendData[]>([]);

  const openAlertsSheet = () => {
    setClickOutsideEnabled?.(false);
    onOpen();
  };

  const closeAlertsSheet = () => {
    setClickOutsideEnabled?.(true);
    onClose();
  };

  useEffect(() => {
    const fetchTrendsData = async () => {
      setDailyTrendData(
        await getTrendsData(
          dsId as string,
          nodeSignificanceData?.[0]?.['node'],
          'date'
        )
      );
    };
    fetchTrendsData();
  }, [nodeSignificanceData, dsId]);

  return (
    <>
      <Box h={'auto'} minHeight={'18'} pt={'6'} pb={'7'}>
        <Text fontWeight={'medium'} fontSize={'base'} lineHeight={'base'}>
          {nodeSignificanceData?.[0]?.['node']}
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
                {formatDatalabel(nodeSignificanceData?.[0]?.['nodeHits'])}
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
                nodeSignificanceData?.[0]?.['nodeHits'],
                nodeSignificanceData?.[0]?.['totalHits']
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
        nodeName={nodeSignificanceData?.[0]?.['node']}
        isAlertsSheetOpen={isAlertsSheetOpen}
        closeAlertsSheet={closeAlertsSheet}
        variant={NotificationVariant.NODE}
        reference={nodeSignificanceData?.[0]?.['node']}
        eventData={dailyTrendData}
      />
    </>
  );
};

export default NodeSignificance;
