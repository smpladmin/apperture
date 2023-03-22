import { Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import FunnelImage from '@assets/images/funnel.svg';

const FunnelEmptyState = () => {
  return (
    <Flex justifyContent={'center'} width={'full'} pt={'10'}>
      <Flex direction={'column'} gap={'6'} data-testid={'funnel-empty-state'}>
        <Image src={FunnelImage} priority={true} alt={'funnel-empty-state'} />
        <Flex direction={'column'} gap={'1'}>
          <Text
            textAlign={'center'}
            fontSize={'base'}
            lineHeight={'base'}
            fontWeight={'bold'}
          >
            Select two events to get started.
          </Text>
          <Text
            textAlign={'center'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'normal'}
            color={'grey.500'}
            maxW={'100'}
          >
            Explore how users navigate between any two events on your product
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default FunnelEmptyState;
