import {
  Button,
  Divider,
  Flex,
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import Render from '@components/Render';
import React, { useEffect, useState } from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import ActionMenu from '../../ActionMenu';
import 'remixicon/fonts/remixicon.css';
import { BASTILLE } from '@theme/index';
import { FunnelStep, FunnelTrendsData } from '@lib/domain/funnel';
import { useRouter } from 'next/router';
import Alert from '@components/Alerts';
import { NotificationVariant } from '@lib/domain/notification';
import { getComputedTrendsData } from '@lib/services/funnelService';

type LeftViewProps = {
  datasourceId: string;
  name: string;
  steps: FunnelStep[];
};

const LeftView = ({ datasourceId, name, steps }: LeftViewProps) => {
  const router = useRouter();
  const { funnelId } = router?.query;
  const { isOpen: isAlertsSheetOpen, onOpen, onClose } = useDisclosure();

  const [dailyTrendData, setDailyTrendData] = useState<FunnelTrendsData[]>([]);

  const handleEditFunnel = () => {
    router.push({
      pathname: '/analytics/funnel/edit/[funnelId]',
      query: { funnelId, dsId: datasourceId },
    });
  };

  const handleGoBack = () => {
    router.push('/analytics/saved');
  };

  const handleNotificationClick = () => {
    onOpen();
  };

  useEffect(() => {
    const fetchTrendsData = async () => {
      setDailyTrendData(await getComputedTrendsData(funnelId as string));
    };
    fetchTrendsData();
  }, []);

  return (
    <ActionPanel>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
          onClick={handleGoBack}
        />
        <Render on="desktop">
          <Button
            borderRadius={'50'}
            bg={'black.300'}
            borderColor={'grey.300'}
            borderWidth={'1px'}
            color={'white'}
            variant={'primary'}
            onClick={handleEditFunnel}
            data-testid={'edit-funnel'}
          >
            <Flex alignItems={'center'} gap={'1'}>
              <i className="ri-edit-fill"></i>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'medium'}
                color={'white'}
              >
                Edit
              </Text>
            </Flex>
          </Button>
        </Render>
      </Flex>

      <Flex
        direction={'row'}
        mt={'8'}
        gap={'2'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Text
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
          data-testid={'funnel-name'}
        >
          {name}
        </Text>
        <Render on="mobile">
          <Button
            borderRadius={'50'}
            bg={'black.300'}
            borderColor={'grey.300'}
            borderWidth={'1px'}
            color={'white'}
            variant={'primary'}
            onClick={handleEditFunnel}
          >
            <Flex alignItems={'center'} gap={'1'}>
              <i className="ri-edit-fill"></i>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'medium'}
                color={'white'}
              >
                Edit
              </Text>
            </Flex>
          </Button>
        </Render>
      </Flex>
      <Flex direction={'column'} mt={{ base: '1', md: '4' }}>
        <ViewFunnelSteps steps={steps} />
        <ActionMenu onNotificationClick={handleNotificationClick} />
        <Divider
          mt={'4'}
          orientation="horizontal"
          borderColor={BASTILLE}
          opacity={1}
        />
      </Flex>
      <Alert
        nodeName={'Video_Open'}
        isAlertsSheetOpen={isAlertsSheetOpen}
        closeAlertsSheet={onClose}
        variant={NotificationVariant.FUNNEL}
        reference={funnelId as string}
        eventData={dailyTrendData}
      />
    </ActionPanel>
  );
};

export default LeftView;
