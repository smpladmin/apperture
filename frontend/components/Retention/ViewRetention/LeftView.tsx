import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
// import ViewFunnelSteps from '../components/ViewFunnelSteps';
import 'remixicon/fonts/remixicon.css';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import Card from '@components/Card';
import { Clock } from 'phosphor-react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { GREY_600 } from '@theme/index';
import { Granularity, RetentionEvents } from '@lib/domain/retention';

type LeftViewProps = {
  retentionEvents: RetentionEvents;
  granularity: Granularity;
};

const LeftView = ({ retentionEvents, granularity }: LeftViewProps) => {
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
              {/* {`Steps (${sequenceText})`} */}
            </Text>
            <Box>{/* <ViewFunnelSteps steps={steps} /> */}</Box>
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

            <Card borderColor={'white.200'}>
              <Flex dir={'column'} alignItems={'center'} gap={2}>
                <Clock size={20} color={GREY_600} />
                {/* <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                  color={'black'}
                  data-testid={'conversion-criteria'}
                >{`${conversionWindow.value} ${capitalizeFirstLetter(
                  conversionWindow.type
                )}`}</Text> */}
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Card>
    </ActionPanel>
  );
};

export default LeftView;
