import { Flex, useDisclosure } from '@chakra-ui/react';
import Alert from '@components/Alerts';
import ViewHeader from '@components/EventsLayout/ViewHeader';
import { DateFilterObj, ExternalSegmentFilter } from '@lib/domain/common';
import {
  ConversionWindowList,
  ConversionWindowObj,
  Funnel,
  FunnelData,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import { Notifications, NotificationVariant } from '@lib/domain/notification';
import {
  getTransientFunnelData,
  getTransientTrendsData,
} from '@lib/services/funnelService';
import { getNotificationByReference } from '@lib/services/notificationService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { replaceFilterValueWithEmptyStringPlaceholder } from '../util';
import LeftView from './LeftView';
import RightView from './RightView';
import { replaceEmptyStringWithPlaceholderInExternalSegmentFilter } from '@lib/utils/common';

const ViewFunnel = ({
  savedFunnel,
  savedNotification,
}: {
  savedFunnel: Funnel;
  savedNotification: Notifications;
}) => {
  const router = useRouter();
  const {
    pathname,
    query: { funnelId, dsId, showAlert },
  } = router;

  const datasourceId = (dsId as string) || savedFunnel.datasourceId;
  const [isLoading, setIsLoading] = useState(Boolean(savedFunnel.steps.length));
  const [computedFunnelData, setComputedFunnelData] = useState<FunnelData[]>(
    []
  );
  const [computedTrendsData, setComputedTrendsData] = useState<
    FunnelTrendsData[]
  >([]);
  const [notification, setNotification] = useState(savedNotification);
  const [isModalClosed, setIsModalClosed] = useState(false);
  const [dateFilter] = useState<DateFilterObj>({
    filter: savedFunnel?.dateFilter?.filter || null,
    type: savedFunnel?.dateFilter?.type || null,
  });
  const [conversionWindow] = useState<ConversionWindowObj>({
    value: savedFunnel?.conversionWindow?.value || 30,
    type: savedFunnel?.conversionWindow?.type || ConversionWindowList.DAYS,
  });
  const [randomSequence] = useState(savedFunnel.randomSequence);
  const [funnelSteps] = useState(
    replaceFilterValueWithEmptyStringPlaceholder(savedFunnel.steps)
  );
  const [segmentFilters] = useState<ExternalSegmentFilter[] | null>(
    savedFunnel?.segmentFilter
      ? replaceEmptyStringWithPlaceholderInExternalSegmentFilter(
          savedFunnel.segmentFilter
        )
      : null
  );
  const { isOpen: isAlertsSheetOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchComputeData = async () => {
      const [computedFunnelResponse, computedTrendsResponse] =
        await Promise.all([
          getTransientFunnelData(
            datasourceId,
            savedFunnel.steps,
            dateFilter,
            conversionWindow,
            randomSequence,
            segmentFilters
          ),
          getTransientTrendsData(
            datasourceId,
            savedFunnel.steps,
            dateFilter,
            conversionWindow,
            randomSequence,
            segmentFilters
          ),
        ]);
      // status would be undefined if the call is cancelled
      if (computedFunnelResponse?.status && computedTrendsResponse?.status) {
        setComputedFunnelData(computedFunnelResponse?.data || []);
        setComputedTrendsData(computedTrendsResponse?.data || []);
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    fetchComputeData();
  }, []);

  useEffect(() => {
    if (!isModalClosed) return;

    const getNotificationForFunnel = async () => {
      const res =
        (await getNotificationByReference(
          savedFunnel._id,
          savedFunnel.datasourceId
        )) || {};
      setNotification(res);
    };
    getNotificationForFunnel();
  }, [isModalClosed]);

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
      pathname: '/analytics/home/[dsId]',
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
    <Flex
      px={'5'}
      direction={'column'}
      h={'full'}
      bg={'white.400'}
      overflow={'auto'}
    >
      <ViewHeader
        name={savedFunnel?.name}
        handleGoBack={handleGoBack}
        handleEditClick={handleEditFunnel}
        handleNotificationClick={handleNotificationClick}
      />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={'5'}
        flexGrow={1}
        bg={'white.400'}
      >
        <LeftView
          steps={funnelSteps}
          conversionWindow={conversionWindow}
          randomSequence={randomSequence}
          segmentFilters={segmentFilters}
        />
        <RightView
          funnelSteps={funnelSteps}
          computedFunnel={computedFunnelData}
          computedTrendsData={computedTrendsData}
          isLoading={isLoading}
          dateFilter={dateFilter}
          conversionWindow={conversionWindow}
          randomSequence={randomSequence}
          segmentFilters={segmentFilters}
        />
        <Alert
          name={savedFunnel.name}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={handleCloseAlertsModal}
          variant={NotificationVariant.FUNNEL}
          reference={funnelId as string}
          eventData={computedTrendsData}
          datasourceId={datasourceId}
          savedAlert={notification}
        />
      </Flex>
    </Flex>
  );
};

export default ViewFunnel;
