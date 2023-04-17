import { Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import RetentionEmpty from '@assets/images/retention-empty.svg';

const RetentionEmptyState = () => {
  return (
    <Flex justifyContent={'center'} width={'full'} pt={'10'}>
      <Flex
        direction={'column'}
        gap={'6'}
        data-testid={'retention-empty-state'}
      >
        <Image
          src={RetentionEmpty}
          priority={true}
          alt={'funnel-empty-state'}
        />
        <Flex direction={'column'} gap={'1'}>
          <Text
            textAlign={'center'}
            fontSize={'base'}
            lineHeight={'base'}
            fontWeight={'500'}
          >
            Add two events to get started{' '}
          </Text>
          <Text
            textAlign={'center'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'normal'}
            color={'grey.500'}
            maxW={'120'}
          >
            Explore retention of users and cohorts across different events
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default RetentionEmptyState;
