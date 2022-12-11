import { Spinner } from '@chakra-ui/react';
import { BLACK_RUSSIAN } from '@theme/index';

const LoadingSpinner = () => {
  return (
    <Spinner
      thickness="4px"
      speed="0.5s"
      emptyColor="gray.200"
      color={BLACK_RUSSIAN}
      size="xl"
      data-testid="funnel-loader"
    />
  );
};

export default LoadingSpinner;
