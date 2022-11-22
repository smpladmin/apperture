import { Flex } from '@chakra-ui/react';
import { ComputedFunnel } from '@lib/domain/funnel';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = ({
  computedFunnelData,
}: {
  computedFunnelData: ComputedFunnel;
}) => {
  const { datasourceId, name, steps, computedFunnel } = computedFunnelData;

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'} w={'full'}>
      <LeftView datasourceId={datasourceId} name={name} steps={steps} />
      {/* <RightView computedFunnel={computedFunnel} /> */}
    </Flex>
  );
};

export default ViewFunnel;
