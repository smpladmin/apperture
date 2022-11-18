import { Flex } from '@chakra-ui/react';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewFunnel = ({ computedFunnelData }: any) => {
  const { name, steps, computedFunnel } = computedFunnelData;

  return (
    <Flex h={'full'}>
      <LeftView name={name} steps={steps} />
      <RightView computedFunnel={computedFunnel} />
    </Flex>
  );
};

export default ViewFunnel;
