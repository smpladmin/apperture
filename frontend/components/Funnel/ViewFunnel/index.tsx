import { Flex } from '@chakra-ui/react';
import { ComputedFunnel } from '@lib/domain/funnel';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = ({
  computedFunnelData,
}: {
  computedFunnelData: ComputedFunnel;
}) => {
  const { name, steps, computedFunnel } = computedFunnelData;

  return (
    <Flex h={'full'} w={'full'}>
      <LeftView name={name} steps={steps} />
      <RightView computedFunnel={computedFunnel} />
    </Flex>
  );
};

export default ViewFunnel;
