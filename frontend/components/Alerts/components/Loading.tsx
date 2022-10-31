import { Flex, Skeleton } from '@chakra-ui/react';

const Loading = () => {
  return (
    <Flex direction={'column'} gap={'6'} p={'4'}>
      <Skeleton height={'12'} fadeDuration={1} bg={'white.100'} />
      <Skeleton height={'12'} fadeDuration={1} bg={'white.100'} />
      <Skeleton height={'70'} fadeDuration={1} bg={'white.100'} />
    </Flex>
  );
};

export default Loading;
