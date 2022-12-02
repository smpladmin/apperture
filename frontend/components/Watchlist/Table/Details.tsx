import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

export const Details = ({ info }: { info: any }) => {
  const { name, steps } = info.getValue();
  return (
    <Flex direction={'column'} gap={'1'}>
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'600'}>
        {name}
      </Text>
      <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
        {steps}
      </Text>
    </Flex>
  );
};

export default Details;
