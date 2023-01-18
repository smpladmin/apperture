import { Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import CreateFunnelAction from './CreateFunnelAction';
import { useContext, useEffect, useState } from 'react';
import { MapContext } from '@lib/contexts/mapContext';
import FunnelEmptyState from '../components/FunnelEmptyState';
import { FunnelData, FunnelStep, FunnelTrendsData } from '@lib/domain/funnel';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import TransientFunnelView from './TransientFunnelView';
import {
  filterFunnelSteps,
  getCountOfValidAddedSteps,
  isEveryFunnelStepFiltersValid,
} from '../util';
import {
  getComputedFunnelData,
  getComputedTrendsData,
  getTransientFunnelData,
  getTransientTrendsData,
} from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import LoadingSpinner from '@components/LoadingSpinner';
import { replaceFilterValueWithEmptyStringPlaceholder } from '@components/Funnel/util';

const Funnel = () => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const router = useRouter();
  const {
    query: { dsId, funnelId },
    pathname,
  } = router;

  const [funnelName, setFunnelName] = useState<string>('Untitled Funnel');
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([
    { event: '', filters: [] },
    { event: '', filters: [] },
  ]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [trendsData, setTrendsData] = useState<FunnelTrendsData[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepAdded, setIsStepAdded] = useState(false);
  const [isStepsLoadingOnEdit, setIsStepsLoadingOnEdit] = useState(false);

  useEffect(() => {
    if (pathname.includes('/analytics/funnel/create')) return;
    console.log('fetch');

    const fetchComputedData = async () => {
      const [computedFunnelData, computedTrendsData] = await Promise.all([
        getComputedFunnelData(funnelId as string),
        getComputedTrendsData(funnelId as string),
      ]);
      setFunnelName(computedFunnelData.name);
      setFunnelSteps(
        replaceFilterValueWithEmptyStringPlaceholder(computedFunnelData.steps)
      );
      setFunnelData(computedFunnelData.computedFunnel);
      setTrendsData(computedTrendsData);
      setIsLoading(false);
      setIsStepsLoadingOnEdit(false);
    };
    setIsLoading(true);
    setIsStepsLoadingOnEdit(true);

    fetchComputedData();
  }, []);

  useEffect(() => {});

  useEffect(() => {
    if (getCountOfValidAddedSteps(funnelSteps, nodes) >= 2) {
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [funnelSteps, nodes]);

  useEffect(() => {
    if (
      getCountOfValidAddedSteps(funnelSteps, nodes) < 2 ||
      !isEveryFunnelStepFiltersValid(funnelSteps) ||
      isStepAdded
    ) {
      setIsStepAdded(false);
      return;
    }
    const getFunnelMetricsData = async () => {
      const [funnelData, trendsData] = await Promise.all([
        getTransientFunnelData(dsId as string, filterFunnelSteps(funnelSteps)),
        getTransientTrendsData(dsId as string, filterFunnelSteps(funnelSteps)),
      ]);
      setFunnelData(funnelData);
      setTrendsData(trendsData);
      setIsLoading(false);
    };
    setIsLoading(true);
    getFunnelMetricsData();
  }, [funnelSteps]);

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        {isStepsLoadingOnEdit ? (
          <Flex h={'80'} justifyContent={'center'} alignItems={'center'}>
            <LoadingSpinner />
          </Flex>
        ) : (
          <CreateFunnelAction
            funnelName={funnelName}
            setFunnelName={setFunnelName}
            funnelSteps={funnelSteps}
            setFunnelSteps={setFunnelSteps}
            setIsStepAdded={setIsStepAdded}
          />
        )}
      </ActionPanel>
      <ViewPanel>
        {isEmpty ? (
          <FunnelEmptyState />
        ) : (
          <TransientFunnelView
            isLoading={isLoading}
            funnelData={funnelData}
            trendsData={trendsData}
            funnelSteps={funnelSteps}
          />
        )}
      </ViewPanel>
    </Flex>
  );
};

export default Funnel;
