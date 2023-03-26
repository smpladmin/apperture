import { Box, Flex, Text, useDisclosure } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import Render from '@components/Render';
import React, { useEffect } from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import 'remixicon/fonts/remixicon.css';
import { BASTILLE } from '@theme/index';
import {
  ConversionWindowObj,
  FunnelStep,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import { useRouter } from 'next/router';
import Alert from '@components/Alerts';
import { Notifications, NotificationVariant } from '@lib/domain/notification';
import { hasSavedAlert } from '@components/Alerts/util';
import Card from '@components/Card';
import { Clock } from '@phosphor-icons/react';

type LeftViewProps = {
  datasourceId: string;
  name: string;
  steps: FunnelStep[];
  eventData: FunnelTrendsData[];
  savedNotification: Notifications;
  setIsModalClosed: Function;
  conversionWindow: ConversionWindowObj;
};

const LeftView = ({
  datasourceId,
  name,
  steps,
  eventData,
  savedNotification,
  setIsModalClosed,
  conversionWindow,
}: LeftViewProps) => {
  const router = useRouter();

  const {
    pathname,
    query: { funnelId, showAlert },
  } = router;
  const { isOpen: isAlertsSheetOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (showAlert) onOpen();
  }, []);

  const handleEditFunnel = () => {
    router.push({
      pathname: '/analytics/funnel/edit/[funnelId]',
      query: { funnelId, dsId: datasourceId },
    });
  };

  const handleGoBack = () => {
    router.push({
      pathname: '/analytics/funnel/list/[dsId]',
      query: { dsId: datasourceId },
    });
  };

  const handleNotificationClick = () => {
    onOpen();
    router.replace({
      pathname,
      query: { ...router.query, showAlert: true },
    });
    setIsModalClosed(false);
  };

  const handleCloseAlertsModal = () => {
    if (showAlert) {
      delete router.query.showAlert;
      router.replace({
        pathname: pathname,
        query: { ...router.query },
      });
    }
    onClose();
    setIsModalClosed(true);
  };

  return (
    <ActionPanel>
      <Card>
        <Flex direction={'column'} gap={'6'} w={'full'}>
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              Steps (sequential)
            </Text>
            <Box>
              <ViewFunnelSteps steps={steps} />
            </Box>
          </Flex>
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              Conversion Time
            </Text>

            <Card>
              <Flex dir={'column'} alignItems={'center'} gap={2}>
                <Clock size={20} color={'#9E9E9E'} />
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                  color={'black'}
                >{` ${conversionWindow.value} ${conversionWindow.type}`}</Text>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Card>
    </ActionPanel>
  );
};

export default LeftView;
