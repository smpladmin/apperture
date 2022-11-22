import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useState } from 'react';

function ViewFunnelSteps({ steps }: any) {
  const [stepsLength] = useState(steps?.length);
  return (
    <Flex gap={'4'} alignItems={'center'}>
      <Flex flexDir={'column'} alignItems={'center'}>
        <Box bg={'grey.200'} w={'7px'} h={'7px'} borderRadius={'full'}></Box>
        <Box my={'1'} minH={10} w={'1px'} bg={'grey.200'}></Box>
        <Box bg={'grey.200'} w={'7px'} h={'7px'} borderRadius={'full'}></Box>
      </Flex>
      <Flex gap={'1'} direction={'column'}>
        <Text color={'white'} fontSize={'xs-14'} lineHeight={'sh-20'}>
          {steps?.[0]?.['event']}
        </Text>
        <Text
          color={'grey.200'}
          fontSize={'xs-14'}
          lineHeight={'sh-20'}
          minH={'6'}
        >
          {stepsLength > 2 ? `+${stepsLength - 2} Steps` : null}
        </Text>
        <Text color={'white'} fontSize={'xs-14'} lineHeight={'sh-20'}>
          {steps?.[stepsLength - 1]?.['event']}
        </Text>
      </Flex>
    </Flex>
  );
}

export default ViewFunnelSteps;
