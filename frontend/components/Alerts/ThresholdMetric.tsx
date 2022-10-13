import {
  Box,
  Flex,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
} from '@chakra-ui/react';
import { formatDatalabel } from '@components/Graph/graphUtil';

export const Parallelline = () => {
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

type ThresholdMetricProps = {
  thresholdRange: number[];
  setThresholdRange: Function;
};

const ThresholdMetric = ({
  thresholdRange,
  setThresholdRange,
}: ThresholdMetricProps) => {
  return (
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
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'semibold'}>
            {formatDatalabel(thresholdRange?.[0])}
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
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'semibold'}>
            {formatDatalabel(thresholdRange?.[1])}
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
  );
};

export default ThresholdMetric;
