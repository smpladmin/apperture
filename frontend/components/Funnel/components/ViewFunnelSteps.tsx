import { Box, Flex, Text } from '@chakra-ui/react';
import { FunnelStep } from '@lib/domain/funnel';
import React from 'react';

function ViewFunnelSteps({ steps }: { steps: FunnelStep[] }) {
  return (
    <Flex
      direction={'column'}
      borderWidth={'1px'}
      borderRadius={'8px'}
      borderColor={'white.200'}
      borderBottom={'0px'}
      overflow={'hidden'}
    >
      {steps.map((step: FunnelStep, index) => {
        return (
          <Box
            key={index}
            borderBottom={'1px'}
            borderColor={'white.200'}
            padding={3}
          >
            <Flex>
              <Flex alignItems={'center'} justifyContent={'flex-start'}>
                <Box paddingRight={1}>
                  <Flex
                    background={'blue.500'}
                    p={2}
                    height={2}
                    width={2}
                    borderRadius={'4px'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Text
                      fontSize={'xs-10'}
                      lineHeight={'lh-130'}
                      color={'white.DEFAULT'}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </Flex>
                </Box>
                <Text
                  p={1}
                  fontSize={'xs-14'}
                  fontWeight={'500'}
                  lineHeight={'lh-135'}
                >
                  {step.event}
                </Text>
              </Flex>
            </Flex>

            {step.filters.map((filter, index) => {
              return (
                <Flex gap={'1'} key={index}>
                  <Flex
                    w={'full'}
                    paddingLeft={'6'}
                    direction={'column'}
                    flexWrap={'wrap'}
                  >
                    <Flex
                      gap={'1'}
                      alignItems={'center'}
                      direction={'row'}
                      fontSize={'xs-12'}
                      lineHeight={'lh-135'}
                      color={'grey.500'}
                      flexWrap={'wrap'}
                      justifyContent={'flex-start'}
                    >
                      <Text
                        maxWidth={'full'}
                        flexShrink={0}
                        fontSize={'inherit'}
                        lineHeight={'inherit'}
                        color={'inherit'}
                        wordBreak={'break-all'}
                      >{`${filter.condition} `}</Text>
                      <Text
                        maxWidth={'full'}
                        flexShrink={0}
                        fontSize={'inherit'}
                        lineHeight={'inherit'}
                        color={'inherit'}
                        wordBreak={'break-all'}
                      >{`${filter.operand}`}</Text>
                      <Text
                        maxWidth={'full'}
                        flexShrink={0}
                        fontSize={'inherit'}
                        lineHeight={'inherit'}
                        color={'inherit'}
                        wordBreak={'break-all'}
                      >{`${filter.operator}`}</Text>
                      <Text
                        maxWidth={'full'}
                        flexShrink={0}
                        fontSize={'inherit'}
                        lineHeight={'inherit'}
                        color={'inherit'}
                        wordBreak={'break-all'}
                      >{`${filter.values}`}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              );
            })}
          </Box>
        );
      })}
    </Flex>
  );
}

export default ViewFunnelSteps;
