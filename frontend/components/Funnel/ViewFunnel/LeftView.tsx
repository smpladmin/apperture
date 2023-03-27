import { Box, Flex, Text } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import React from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import 'remixicon/fonts/remixicon.css';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import Card from '@components/Card';
import { Clock } from '@phosphor-icons/react';

type LeftViewProps = {
  steps: FunnelStep[];
  conversionWindow: ConversionWindowObj;
};

const LeftView = ({ steps, conversionWindow }: LeftViewProps) => {
  return (
    <ActionPanel>
      <Card>
        <Flex direction={'column'} gap={'6'} w={'full'}>
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              Steps (sequential)
            </Text>
            <Box>
              <ViewFunnelSteps steps={steps} />
            </Box>
          </Flex>
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              Conversion Time
            </Text>

            <Card>
              <Flex dir={'column'} alignItems={'center'} gap={2}>
                <Clock size={20} color={'#9E9E9E'} />
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                  color={'black'}
                >{` ${conversionWindow.value} ${conversionWindow.type}`}</Text>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Card>
    </ActionPanel>
  );
};

export default LeftView;
