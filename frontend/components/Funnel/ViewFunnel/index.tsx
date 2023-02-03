import { Flex } from '@chakra-ui/react';
import { Funnel, FunnelData, FunnelTrendsData } from '@lib/domain/funnel';
import { Notifications } from '@lib/domain/notification';
import {
  getTransientFunnelData,
  getTransientTrendsData,
} from '@lib/services/funnelService';
import { getNotificationByReference } from '@lib/services/notificationService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = ({
  savedFunnel,
  savedNotification,
}: {
  savedFunnel: Funnel;
  savedNotification: Notifications;
}) => {
  const router = useRouter();
  const { dsId } = router.query;

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

  useEffect(() => {
    const fetchComputeData = async () => {
      const [computedFunnelData, computedTrendsData] = await Promise.all([
        getTransientFunnelData(datasourceId, savedFunnel.steps),
        getTransientTrendsData(datasourceId, savedFunnel.steps),
      ]);
      setComputedFunnelData(computedFunnelData);
      setComputedTrendsData(computedTrendsData);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchComputeData();
  }, []);

  useEffect(() => {
    if (!isModalClosed) return;

    const getNotificationForMetric = async () => {
      const res =
        (await getNotificationByReference(
          savedFunnel._id,
          savedFunnel.datasourceId
        )) || {};
      setNotification(res);
    };
    getNotificationForMetric();
  }, [isModalClosed]);

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'} w={'full'}>
      <LeftView
        datasourceId={datasourceId}
        name={savedFunnel.name}
        steps={savedFunnel.steps}
        eventData={computedTrendsData}
        savedNotification={notification}
        setIsModalClosed={setIsModalClosed}
      />
      <RightView
        funnelSteps={savedFunnel.steps}
        computedFunnel={computedFunnelData}
        computedTrendsData={computedTrendsData}
        datasourceId={datasourceId}
        isLoading={isLoading}
      />
    </Flex>
  );
};

export default ViewFunnel;
