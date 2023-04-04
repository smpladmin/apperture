import { Box, Flex, Text } from '@chakra-ui/react';
import ViewFilter from '@components/StepFilters/ViewFilter';
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
                  data-testid={'funnel-event'}
                >
                  {step.event}
                </Text>
              </Flex>
            </Flex>

            {step.filters.map((filter, index) => {
              return <ViewFilter key={index} filter={filter} />;
            })}
          </Box>
        );
      })}
    </Flex>
  );
}

export default ViewFunnelSteps;
