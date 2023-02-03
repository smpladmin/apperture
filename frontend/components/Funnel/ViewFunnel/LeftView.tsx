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
import React, { useEffect } from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import ActionMenu from '../../ActionMenu';
import 'remixicon/fonts/remixicon.css';
import { BASTILLE } from '@theme/index';
import { FunnelStep, FunnelTrendsData } from '@lib/domain/funnel';
import { useRouter } from 'next/router';
import Alert from '@components/Alerts';
import { Notifications, NotificationVariant } from '@lib/domain/notification';

type LeftViewProps = {
  datasourceId: string;
  name: string;
  steps: FunnelStep[];
  eventData: FunnelTrendsData[];
  savedNotification: Notifications;
  setIsModalClosed: Function;
};

const LeftView = ({
  datasourceId,
  name,
  steps,
  eventData,
  savedNotification,
  setIsModalClosed,
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
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'primary'}
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
        <ActionMenu
          onNotificationClick={handleNotificationClick}
          hasSavedNotification={Boolean(Object.keys(savedNotification).length)}
        />
        <Divider
          mt={'4'}
          orientation="horizontal"
          borderColor={BASTILLE}
          opacity={1}
        />
      </Flex>
      <Alert
        name={name}
        isAlertsSheetOpen={isAlertsSheetOpen}
        closeAlertsSheet={handleCloseAlertsModal}
        variant={NotificationVariant.FUNNEL}
        reference={funnelId as string}
        eventData={eventData}
        datasourceId={datasourceId}
        savedAlert={savedNotification}
      />
    </ActionPanel>
  );
};

export default LeftView;
