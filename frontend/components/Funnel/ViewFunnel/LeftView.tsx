import { Flex, Text } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import React from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import 'remixicon/fonts/remixicon.css';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';

type LeftViewProps = {
  steps: FunnelStep[];
  conversionWindow: ConversionWindowObj;
};

const LeftView = ({ steps, conversionWindow }: LeftViewProps) => {
  return (
    <ActionPanel>
      <Flex direction={'column'} mt={{ base: '1', md: '4' }}>
        <ViewFunnelSteps steps={steps} />
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          color={'white'}
          marginTop={'4'}
        >{`Conversion Time: ${conversionWindow.value} ${conversionWindow.type}`}</Text>
      </Flex>
    </ActionPanel>
  );
};

export default LeftView;
