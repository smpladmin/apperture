import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import 'remixicon/fonts/remixicon.css';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import Card from '@components/Card';
import { Clock } from '@phosphor-icons/react';
import ActionPanelTemp from '@components/EventsLayout/ActionPanelTemp';

type LeftViewProps = {
  steps: FunnelStep[];
  conversionWindow: ConversionWindowObj;
  randomSequence: boolean;
};

const LeftView = ({
  steps,
  conversionWindow,
  randomSequence,
}: LeftViewProps) => {
  const sequenceText = randomSequence ? 'Any order' : 'In sequence';
  return (
    <ActionPanelTemp>
      <Card>
        <Flex direction={'column'} gap={'6'} w={'full'}>
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              {`Steps (${sequenceText})`}
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
    </ActionPanelTemp>
  );
};

export default LeftView;
