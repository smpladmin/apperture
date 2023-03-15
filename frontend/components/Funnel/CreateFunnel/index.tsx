import { Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import CreateFunnelAction from './CreateFunnelAction';
import { useEffect, useState } from 'react';
import FunnelEmptyState from '../components/FunnelEmptyState';
import {
  Funnel,
  FunnelData,
  FunnelDateFilter,
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
} from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import { replaceFilterValueWithEmptyStringPlaceholder } from '@components/Funnel/util';

const CreateFunnel = ({ savedFunnel }: { savedFunnel?: Funnel }) => {
  const router = useRouter();
  const {
    query: { dsId },
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
  const [dateFilter, setDateFilter] = useState<FunnelDateFilter>({
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

  useEffect(() => {
    if (getCountOfValidAddedSteps(funnelSteps) >= 2) {
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [funnelSteps]);

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

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateFunnelAction
          funnelName={funnelName}
          setFunnelName={setFunnelName}
          funnelSteps={funnelSteps}
          setFunnelSteps={setFunnelSteps}
          setIsStepAdded={setIsStepAdded}
          dateFilter={dateFilter}
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
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        )}
      </ViewPanel>
    </Flex>
  );
};

export default CreateFunnel;
