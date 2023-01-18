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
  getTransientFunnelData,
  getTransientTrendsData,
} from '@lib/services/funnelService';
import { useRouter } from 'next/router';

type FunnelProps = {
  name?: string;
  steps?: FunnelStep[];
  computedFunnel?: FunnelData[];
  computedTrendsData?: FunnelTrendsData[];
};

const Funnel = ({
  name,
  steps,
  computedFunnel,
  computedTrendsData,
}: FunnelProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const router = useRouter();
  const { dsId } = router.query;

  const [funnelName, setFunnelName] = useState(name || 'Untitled Funnel');
  const [funnelSteps, setFunnelSteps] = useState(
    steps || [
      { event: '', filters: [] },
      { event: '', filters: [] },
    ]
  );
  const [funnelData, setFunnelData] = useState<FunnelData[]>(
    computedFunnel || []
  );
  const [trendsData, setTrendsData] = useState<FunnelTrendsData[]>(
    computedTrendsData || []
  );
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepAdded, setIsStepAdded] = useState(false);

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
        <CreateFunnelAction
          funnelName={funnelName}
          setFunnelName={setFunnelName}
          funnelSteps={funnelSteps}
          setFunnelSteps={setFunnelSteps}
          setIsStepAdded={setIsStepAdded}
        />
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
