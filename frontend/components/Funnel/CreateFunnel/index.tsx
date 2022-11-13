import { Flex, Spinner, Text } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import CreateFunnelAction from './CreateFunnelAction';
import RightPanel from '@components/EventsLayout/RightPanel';
import FunnelChart from '../components/FunnelChart';
import { useContext, useEffect, useState } from 'react';
import { getCountOfValidAddedSteps } from '../util';
import { MapContext } from '@lib/contexts/mapContext';
import FunnelEmptyState from './FunnelEmptyState';
import { BLACK_RUSSIAN } from '@theme/index';

const Funnel = () => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const [funnelName, setFunnelName] = useState('Untitled Funnel');
  const [funnelSteps, setFunnelSteps] = useState([
    { event: '', filters: [] },
    { event: '', filters: [] },
  ]);
  const [funnelData, setFunnelData] = useState([]);

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
    <Flex w={'full'} height={'full'}>
      <CreateFunnelAction
        funnelName={funnelName}
        setFunnelName={setFunnelName}
        funnelSteps={funnelSteps}
        setFunnelSteps={setFunnelSteps}
        setFunnelData={setFunnelData}
      />
      <RightPanel>
        {isEmpty ? (
          <FunnelEmptyState />
        ) : (
          <Flex px={'30'} py={'30'} direction={'column'} gap={'8'} h={'full'}>
            <Text fontSize={'sh-20'} fontWeight={'semibold'}>
              Funnel
            </Text>
            {isLoading ? (
              <Flex
                w="full"
                h="full"
                justifyContent={'center'}
                alignItems={'center'}
              >
                <Spinner
                  thickness="4px"
                  speed="0.5s"
                  emptyColor="gray.200"
                  color={BLACK_RUSSIAN}
                  size="xl"
                />
              </Flex>
            ) : (
              <FunnelChart />
            )}
          </Flex>
        )}
      </RightPanel>
    </Flex>
  );
};

export default Funnel;
