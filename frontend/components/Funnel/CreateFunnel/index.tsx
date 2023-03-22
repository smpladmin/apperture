import { Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import CreateFunnelAction from './CreateFunnelAction';
import { useEffect, useState } from 'react';
import FunnelEmptyState from '../components/FunnelEmptyState';
import {
  Funnel,
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import TransientFunnelView from './TransientFunnelView';
import {
  filterFunnelSteps,
  getCountOfValidAddedSteps,
  isEveryFunnelStepFiltersValid,
} from '../util';
import {
  getTransientFunnelData,
  getTransientTrendsData,
  saveFunnel,
  updateFunnel,
} from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import { replaceFilterValueWithEmptyStringPlaceholder } from '@components/Funnel/util';
import { DateFilterObj } from '@lib/domain/common';
import Header from '@components/EventsLayout/Header';
import Card from '@components/Card';

const CreateFunnel = ({ savedFunnel }: { savedFunnel?: Funnel }) => {
  const router = useRouter();
  const {
    query: { dsId, funnelId },
  } = router;

  const datasourceId = (dsId as string) || savedFunnel?.datasourceId;
  const [funnelName, setFunnelName] = useState<string>(
    savedFunnel?.name || 'Untitled Funnel'
  );
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>(
    savedFunnel?.steps
      ? replaceFilterValueWithEmptyStringPlaceholder(savedFunnel.steps)
      : [
          { event: '', filters: [] },
          { event: '', filters: [] },
        ]
  );
  const [dateFilter, setDateFilter] = useState<DateFilterObj>({
    filter: savedFunnel?.dateFilter?.filter || null,
    type: savedFunnel?.dateFilter?.type || null,
  });

  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [trendsData, setTrendsData] = useState<FunnelTrendsData[]>([]);
  const [isEmpty, setIsEmpty] = useState(
    savedFunnel?.steps?.length ? false : true
  );
  const [isLoading, setIsLoading] = useState(
    Boolean(savedFunnel?.steps?.length)
  );
  const [isStepAdded, setIsStepAdded] = useState(false);
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [isFunnelBeingEdited, setFunnelBeingEdited] = useState(false);

  useEffect(() => {
    if (getCountOfValidAddedSteps(funnelSteps) >= 2) {
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [funnelSteps]);

  useEffect(() => {
    if (
      getCountOfValidAddedSteps(funnelSteps) >= 2 &&
      isEveryFunnelStepFiltersValid(funnelSteps)
    ) {
      setSaveButtonDisabled(false);
    } else {
      setSaveButtonDisabled(true);
    }
  }, [funnelSteps]);

  useEffect(() => {
    if (router.pathname.includes('edit')) setFunnelBeingEdited(true);
  }, []);

  useEffect(() => {
    if (
      getCountOfValidAddedSteps(funnelSteps) < 2 ||
      !isEveryFunnelStepFiltersValid(funnelSteps) ||
      isStepAdded
    ) {
      setIsStepAdded(false);
      return;
    }

    const getFunnelMetricsData = async () => {
      const [funnelData, trendsData] = await Promise.all([
        getTransientFunnelData(
          datasourceId!!,
          filterFunnelSteps(funnelSteps),
          dateFilter
        ),
        getTransientTrendsData(
          datasourceId!!,
          filterFunnelSteps(funnelSteps),
          dateFilter
        ),
      ]);
      setFunnelData(funnelData);
      setTrendsData(trendsData);
      setIsLoading(false);
    };

    setIsLoading(true);
    getFunnelMetricsData();
  }, [funnelSteps, dateFilter]);

  const handleSaveFunnel = async () => {
    const { data, status } = isFunnelBeingEdited
      ? await updateFunnel(
          funnelId as string,
          dsId as string,
          funnelName,
          filterFunnelSteps(funnelSteps),
          false,
          dateFilter
        )
      : await saveFunnel(
          dsId as string,
          funnelName,
          filterFunnelSteps(funnelSteps),
          false,
          dateFilter
        );

    if (status === 200)
      router.push({
        pathname: '/analytics/funnel/view/[funnelId]',
        query: { funnelId: data?._id || funnelId, dsId },
      });
  };

  return (
    <Flex px={'5'} direction={'column'} h={'full'} bg={'white.400'}>
      <Header
        handleGoBack={() => router.back()}
        name={funnelName}
        setName={setFunnelName}
        handleSave={handleSaveFunnel}
        isSaveButtonDisabled={isSaveButtonDisabled}
      />
      <Flex direction={{ base: 'column', md: 'row' }} gap={'5'} h={'full'}>
        <ActionPanel>
          <Card>
            <CreateFunnelAction
              funnelSteps={funnelSteps}
              setFunnelSteps={setFunnelSteps}
              setIsStepAdded={setIsStepAdded}
            />
          </Card>
        </ActionPanel>
        <ViewPanel>
          {isEmpty ? (
            <Card minHeight="120">
              <FunnelEmptyState />
            </Card>
          ) : (
            <TransientFunnelView
              isLoading={isLoading}
              funnelData={funnelData}
              trendsData={trendsData}
              funnelSteps={funnelSteps}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          )}
        </ViewPanel>
      </Flex>
    </Flex>
  );
};

export default CreateFunnel;
