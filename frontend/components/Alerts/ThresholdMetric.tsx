import { Line } from '@antv/g2plot';
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
import { useEffect, useRef } from 'react';
import { data } from './data';

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
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ line: any | null }>({ line: null });

  useEffect(() => {
    plot.current.line = new Line(ref.current!!, {
      data,
      padding: 'auto',
      xField: 'startDate',
      yField: 'hits',
      yAxis: {
        tickCount: 6,
      },
      xAxis: {
        label: {
          style: {
            opacity: 0,
          },
        },
        tickCount: 0,
      },
      meta: {
        hits: {},
      },
      lineStyle: {
        stroke: '#6BBDF9',
      },
      animation: false,
    });
    plot.current.line?.render();
  }, [data]);

  useEffect(() => {
    plot.current.line?.update({
      annotations: [
        {
          type: 'line',
          start: ['min', thresholdRange?.[0]],
          end: ['max', thresholdRange?.[0]],
          style: {
            lineDash: [4, 4],
            stroke: '#FABC41',
          },
        },
        {
          type: 'line',
          start: ['min', thresholdRange?.[1]],
          end: ['max', thresholdRange?.[1]],
          style: {
            lineDash: [4, 4],
            stroke: '#FABC41',
          },
        },
        {
          type: 'region',
          start: ['min', thresholdRange?.[0]],
          end: ['max', thresholdRange?.[1]],
          style: {
            fill: '#FFD98A',
            fillOpacity: '0.15',
          },
        },
      ],
    });
  }, [thresholdRange]);

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
          min={10}
          max={1200}
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
      <Box ref={ref} mt={'4'} overflowY={'scroll'} height={'50'}></Box>
    </Box>
  );
};

export default ThresholdMetric;
