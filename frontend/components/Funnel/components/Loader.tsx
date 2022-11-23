import { Flex, Spinner } from '@chakra-ui/react';
import { BLACK_RUSSIAN } from '@theme/index';

const Loader = () => {
  return (
    <Flex
      w="full"
      h="full"
      justifyContent={'center'}
      alignItems={'center'}
      minH={'50'}
    >
      <Spinner
        thickness="4px"
        speed="0.5s"
        emptyColor="gray.200"
        color={BLACK_RUSSIAN}
        size="xl"
      />
    </Flex>
  );
};

export default Loader;
