import { Flex, Text } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import CreateFunnelAction from './CreateFunnelAction';
import RightPanel from '@components/EventsLayout/RightPanel';
import FunnelChart from '../components/FunnelChart';
import { useContext, useEffect, useState } from 'react';
import { getCountOfValidAddedSteps } from '../util';
import { MapContext } from '@lib/contexts/mapContext';
import FunnelEmptyState from '../components/FunnelEmptyState';
import { FunnelData, FunnelStep } from '@lib/domain/funnel';
import LeftPanel from '@components/EventsLayout/LeftPanel';
import Loader from '../components/Loader';

type FunnelProps = {
  name?: string;
  steps?: FunnelStep[];
  computedFunnel?: FunnelData[];
};

const Funnel = ({ name, steps, computedFunnel }: FunnelProps) => {
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
    if (funnelData.length) {
      setIsLoading(false);
    } else setIsLoading(true);
  }, [funnelData]);

  return (
    <Flex direction={{ base: 'column', md: 'row' }} w={'full'} height={'full'}>
      <LeftPanel>
        <CreateFunnelAction
          funnelName={funnelName}
          setFunnelName={setFunnelName}
          funnelSteps={funnelSteps}
          setFunnelSteps={setFunnelSteps}
          setFunnelData={setFunnelData}
        />
      </LeftPanel>
      <RightPanel>
        {isEmpty ? (
          <FunnelEmptyState />
        ) : (
          <Flex
            px={{ base: '4', md: '30' }}
            py={{ base: '8', md: '30' }}
            direction={'column'}
            gap={'8'}
          >
            <Text fontSize={'sh-20'} fontWeight={'semibold'}>
              Funnel
            </Text>
            {isLoading ? <Loader /> : <FunnelChart data={funnelData} />}
          </Flex>
        )}
      </RightPanel>
    </Flex>
  );
};

export default Funnel;
