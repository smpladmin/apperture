import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import FunnelImage from '@assets/images/funnel.svg';

const FunnelEmptyState = () => {
  return (
    <Flex
      h={'full'}
      alignItems={'center'}
      justifyContent={'center'}
      px={'6'}
      py={'6'}
    >
      <Box>
        <Image
          src={FunnelImage}
          priority={true}
          alt={'funnel-empty-state'}
          data-testid={'funnel-empty-state'}
        />
        <Text
          textAlign={'center'}
          mt={'10'}
          fontSize={'sh-20'}
          lineHeight={'sh-20'}
          fontWeight={'normal'}
          color={'grey.100'}
        >
          Enter events to create a funnel
        </Text>
      </Box>
    </Flex>
  );
};

export default FunnelEmptyState;
