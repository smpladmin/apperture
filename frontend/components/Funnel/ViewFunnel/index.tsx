import { Flex } from '@chakra-ui/react';
import { ComputedFunnel, FunnelTrendsData } from '@lib/domain/funnel';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = ({
  computedFunnelData,
  computedTrendsData,
}: {
  computedFunnelData: ComputedFunnel;
  computedTrendsData: FunnelTrendsData[];
}) => {
  const { datasourceId, name, steps, computedFunnel } = computedFunnelData;

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'} w={'full'}>
      <LeftView datasourceId={datasourceId} name={name} steps={steps} />
      <RightView
        computedFunnel={computedFunnel}
        computedTrendsData={computedTrendsData}
        datasourceId={datasourceId}
      />
    </Flex>
  );
};

export default ViewFunnel;
