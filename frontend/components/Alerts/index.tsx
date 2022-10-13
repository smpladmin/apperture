import Sheet from 'react-modal-sheet';
import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  RadioGroup,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
} from '@chakra-ui/react';
import AlertMetricOption from './AlertOption';
import 'remixicon/fonts/remixicon.css';
import { formatDatalabel } from '@components/Graph/graphUtil';

const Parallelline = () => {
  return (
    <svg
      width="6"
      height="8"
      viewBox="0 0 6 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.3999 0.159607L4.4399 0.159607L4.4399 7.83961L5.3999 7.83961L5.3999 0.159607ZM1.5599 0.159607L0.599902 0.159607L0.599902 7.83961L1.5599 7.83961L1.5599 0.159607Z"
        fill="white"
      />
    </svg>
  );
};

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
  const metricOptions = [
    {
      name: 'users',
      label: '#Users',
    },
    {
      name: 'hits',
      label: '#Hits',
    },
  ];

  const thresholdOptions = [
    {
      name: 'range',
      label: 'out of Range',
    },
    {
      name: 'percentage',
      label: 'more than %',
    },
  ];

  const [notificationMetric, setnotificationMetric] = useState(
    metricOptions[0].name
  );
  const [thresholdMetric, setThresholdMetric] = useState(
    thresholdOptions[0].name
  );

  const [thresholdRange, setThresholdRange] = useState<number[]>([5000, 15000]);
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
            <Box px={'4'} py={'4'}>
              {/* user/hits */}
              <Flex direction={'column'} gap={'2'} mb={'4'}>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'semibold'}
                >
                  When daily
                </Text>

                <RadioGroup
                  value={notificationMetric}
                  onChange={(value) => setnotificationMetric(value)}
                >
                  <Flex gap={'2'}>
                    {metricOptions.map((option) => {
                      return (
                        <Flex key={option.name}>
                          <AlertMetricOption
                            option={option}
                            isChecked={option.name === notificationMetric}
                          />
                        </Flex>
                      );
                    })}
                  </Flex>
                </RadioGroup>
              </Flex>

              <Divider
                orientation="horizontal"
                borderColor={'white.200'}
                opacity={1}
                mb={'4'}
              />
              {/* movement */}
              <Flex direction={'column'} gap={'2'} mb={'4'}>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'semibold'}
                >
                  moves
                </Text>
                <RadioGroup
                  value={thresholdMetric}
                  onChange={(value) => setThresholdMetric(value)}
                >
                  <Flex gap={'2'}>
                    {thresholdOptions.map((option) => {
                      return (
                        <Flex key={option.name}>
                          <AlertMetricOption
                            option={option}
                            isChecked={option.name === thresholdMetric}
                          />
                        </Flex>
                      );
                    })}
                  </Flex>
                </RadioGroup>
              </Flex>
              {/* slider */}
              {thresholdMetric === 'range' ? (
                <Box>
                  <Flex justifyContent={'space-between'}>
                    <Flex direction={'column'} gap={'1'}>
                      <Text
                        fontSize={'xs-10'}
                        lineHeight={'xs-10'}
                        color={'grey.100'}
                        fontWeight={'normal'}
                      >
                        Lower Bound
                      </Text>
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                        fontWeight={'semibold'}
                      >
                        {formatDatalabel(thresholdRange[0])}
                      </Text>
                    </Flex>
                    <Flex direction={'column'}>
                      <Text
                        fontSize={'xs-10'}
                        lineHeight={'xs-10'}
                        color={'grey.100'}
                        fontWeight={'normal'}
                      >
                        Upper Bound
                      </Text>
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                        fontWeight={'semibold'}
                      >
                        {formatDatalabel(thresholdRange[1])}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex mt={'2'} py={'4'}>
                    <RangeSlider
                      defaultValue={thresholdRange}
                      min={999}
                      max={20000}
                      onChange={(val) => setThresholdRange(val)}
                    >
                      <RangeSliderTrack bg="white.200">
                        <RangeSliderFilledTrack bg="black.100" />
                      </RangeSliderTrack>
                      <RangeSliderThumb boxSize={5} index={0} bg={'black.100'}>
                        <Parallelline />
                      </RangeSliderThumb>
                      <RangeSliderThumb boxSize={5} index={1} bg={'black.100'}>
                        <Parallelline />
                      </RangeSliderThumb>
                    </RangeSlider>
                  </Flex>
                </Box>
              ) : null}
              {thresholdMetric === 'percentage' ? (
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
