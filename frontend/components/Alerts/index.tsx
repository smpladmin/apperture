import Sheet from 'react-modal-sheet';
import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Text,
} from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import AlertMetrics from './AlertMetrics';
import { notificationMetricOptions, thresholdMetricOptions } from './util';
import ThresholdMetric from './ThresholdMetric';

enum AlertThresholdType {
  Range = 'range',
  Percentage = 'percentage',
}

const AlertsHeader = ({ setOpen }: { setOpen: Function }) => {
  return (
    <>
      <Flex
        justifyContent={'space-between'}
        pt={'5'}
        px={'4'}
        pb={'4'}
        alignItems={'center'}
      >
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'semibold'}>
          Alert me
        </Text>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          size={'sm'}
          onClick={() => setOpen(false)}
        />
      </Flex>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
    </>
  );
};

const Alerts = () => {
  const [isOpen, setOpen] = useState(false);

  const [notificationMetric, setNotificationMetric] = useState(
    notificationMetricOptions[0].name
  );
  const [thresholdMetric, setThresholdMetric] = useState(
    thresholdMetricOptions[0].name
  );
  const [thresholdRange, setThresholdRange] = useState<number[]>([800, 950]);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open sheet</button>
      <Sheet
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        disableDrag={true}
        detent="content-height"
      >
        <Sheet.Container>
          <Sheet.Header>
            <AlertsHeader setOpen={setOpen} />
          </Sheet.Header>
          <Sheet.Content>
            <Box px={'4'} py={'4'} overflowY={'scroll'}>
              <AlertMetrics
                notificationMetric={notificationMetric}
                setNotificationMetric={setNotificationMetric}
                thresholdMetric={thresholdMetric}
                setThresholdMetric={setThresholdMetric}
              />

              {/* slider */}
              {thresholdMetric === AlertThresholdType.Range ? (
                <ThresholdMetric
                  thresholdRange={thresholdRange}
                  setThresholdRange={setThresholdRange}
                />
              ) : null}
              {thresholdMetric === AlertThresholdType.Percentage ? (
                <Flex direction={'column'} gap={'1'}>
                  <Text
                    fontSize={'xs-10'}
                    lineHeight={'xs-10'}
                    color={'grey.100'}
                    fontWeight={'normal'}
                  >
                    % Change
                  </Text>
                  <Input
                    type={'number'}
                    bg={'white.100'}
                    focusBorderColor={'black.100'}
                    autoFocus
                  />
                </Flex>
              ) : null}
              <Button
                variant={'primary'}
                rounded={'lg'}
                bg={'black.100'}
                p={6}
                fontSize={{ base: 'xs-14', md: 'base' }}
                lineHeight={{ base: 'xs-14', md: 'base' }}
                fontWeight={'semibold'}
                textColor={'white.100'}
                w={'full'}
                mt={'4'}
              >
                Done
              </Button>
            </Box>
          </Sheet.Content>
        </Sheet.Container>

        <Sheet.Backdrop />
      </Sheet>
    </>
  );
};

export default Alerts;
