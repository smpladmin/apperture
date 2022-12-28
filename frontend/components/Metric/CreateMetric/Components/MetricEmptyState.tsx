import { Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import MetricImage from '@assets/images/metric.svg';

const MetricEmptyState = () => {
  return (
    <Flex
      grow={1}
      h={'full'}
      justifyContent={'center'}
      alignContent={'center'}
      px={'6'}
    >
      <Flex
        direction={'column'}
        justifyContent={'center'}
        gap={'6'}
        data-testid={'funnel-empty-state'}
      >
        <Image src={MetricImage} priority={true} alt={'funnel-empty-state'} />
        <Flex direction={'column'} gap={'1'}>
          <Text
            textAlign={'center'}
            fontSize={'base'}
            lineHeight={'base'}
            fontWeight={'semibold'}
          >
            Add a metric to get started
          </Text>
          <Text
            textAlign={'center'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'normal'}
            color={'grey.200'}
          >
            Explore trends of events, segments and create custom formulas.
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MetricEmptyState;
