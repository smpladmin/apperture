import { Flex } from '@chakra-ui/react';
import { Funnel, FunnelData, FunnelTrendsData } from '@lib/domain/funnel';
import {
  getTransientFunnelData,
  getTransientTrendsData,
} from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = ({ savedFunnel }: { savedFunnel: Funnel }) => {
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

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'} w={'full'}>
      <LeftView
        datasourceId={datasourceId}
        name={savedFunnel.name}
        steps={savedFunnel.steps}
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
