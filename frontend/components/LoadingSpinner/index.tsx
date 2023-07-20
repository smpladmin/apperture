import { ResponsiveValue, Spinner } from '@chakra-ui/react';
import { BLACK_RUSSIAN } from '@theme/index';

const LoadingSpinner = ({
  size = 'xl',
}: {
  size?: ResponsiveValue<'xl' | (string & {}) | 'sm' | 'md' | 'lg' | 'xs'>;
}) => {
  return (
    <Spinner
      thickness="4px"
      speed="0.5s"
      emptyColor="gray.200"
      color={BLACK_RUSSIAN}
      size={size}
      data-testid="funnel-loader"
    />
  );
};

export default LoadingSpinner;
