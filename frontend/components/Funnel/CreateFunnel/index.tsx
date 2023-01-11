import { Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import CreateFunnelAction from './CreateFunnelAction';
import { useContext, useEffect, useState } from 'react';
import { getCountOfValidAddedSteps } from '../util';
import { MapContext } from '@lib/contexts/mapContext';
import FunnelEmptyState from '../components/FunnelEmptyState';
import { FunnelData, FunnelStep, FunnelTrendsData } from '@lib/domain/funnel';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import TransientFunnelView from './TransientFunnelView';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (getCountOfValidAddedSteps(funnelSteps, nodes) >= 2) {
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [funnelSteps, nodes]);

  useEffect(() => {
    if (funnelData?.length) {
      setIsLoading(false);
    } else setIsLoading(true);
  }, [funnelData]);

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateFunnelAction
          funnelName={funnelName}
          setFunnelName={setFunnelName}
          funnelSteps={funnelSteps}
          setFunnelSteps={setFunnelSteps}
          setFunnelData={setFunnelData}
          setTrendsData={setTrendsData}
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
