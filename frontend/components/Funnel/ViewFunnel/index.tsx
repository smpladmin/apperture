import { Flex } from '@chakra-ui/react';
import { ComputedFunnel, FunnelTrendsData } from '@lib/domain/funnel';
import {
  getComputedFunnelData,
  getComputedTrendsData,
} from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = () => {
  const router = useRouter();
  const { funnelId } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [computedFunnelData, setComputedFunnelData] = useState<
    ComputedFunnel | {}
  >({});
  const [computedTrendsData, setComputedTrendsData] = useState<
    FunnelTrendsData[]
  >([]);

  useEffect(() => {
    const fetchComputeData = async () => {
      const [computedFunnelData, computedTrendsData] = await Promise.all([
        getComputedFunnelData(funnelId as string),
        getComputedTrendsData(funnelId as string),
      ]);
      setComputedFunnelData(computedFunnelData);
      setComputedTrendsData(computedTrendsData);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchComputeData();
  }, []);

  const { datasourceId, name, steps, computedFunnel } =
    computedFunnelData as ComputedFunnel;

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'} w={'full'}>
      <LeftView
        datasourceId={datasourceId}
        name={name}
        steps={steps}
        isLoading={isLoading}
      />
      <RightView
        funnelSteps={steps}
        computedFunnel={computedFunnel}
        computedTrendsData={computedTrendsData}
        datasourceId={datasourceId}
        isLoading={isLoading}
      />
    </Flex>
  );
};

export default ViewFunnel;
