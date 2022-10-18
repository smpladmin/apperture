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
import { TrendData } from '@lib/domain/eventData';
import { formatDatalabel } from '@lib/utils/common';
import { BLUE, YELLOW_100, YELLOW_200 } from '@theme/index';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import ParallelLineIcon from '@assets/icons/parallel-line.svg';

const ParallelLine = () => {
  return <Image src={ParallelLineIcon} alt={'parallel-line-icon'} />;
};

type ThresholdMetricProps = {
  data: TrendData[];
  thresholdRange: number[];
  setThresholdRange: Function;
  minHit: number;
  maxHit: number;
};

const ThresholdMetric = ({
  data,
  thresholdRange,
  setThresholdRange,
  minHit,
  maxHit,
}: ThresholdMetricProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ line: Line | null }>({ line: null });

  useEffect(() => {
    plot.current.line = new Line(ref.current!!, {
      data,
      padding: 'auto',
      xField: 'startDate',
      yField: 'hits',
      yAxis: {
        tickCount: 5,
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
        hits: {
          min: 0.8 * minHit,
          max: 1.2 * maxHit,
        },
      },
      lineStyle: {
        stroke: BLUE,
      },
      animation: false,
    });
    plot.current.line?.render();
  }, [data, minHit, maxHit]);

  useEffect(() => {
    plot.current.line?.update({
      annotations: [
        {
          type: 'line',
          start: ['min', thresholdRange?.[0]],
          end: ['max', thresholdRange?.[0]],
          style: {
            lineDash: [4, 4],
            stroke: YELLOW_200,
          },
        },
        {
          type: 'line',
          start: ['min', thresholdRange?.[1]],
          end: ['max', thresholdRange?.[1]],
          style: {
            lineDash: [4, 4],
            stroke: YELLOW_200,
          },
        },
        {
          type: 'region',
          start: ['min', thresholdRange?.[0]],
          end: ['max', thresholdRange?.[1]],
          style: {
            fill: YELLOW_100,
            fillOpacity: 0.15,
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
      <Flex mt={'2'} py={'4'} px={'2'}>
        <RangeSlider
          defaultValue={thresholdRange}
          min={0.8 * minHit}
          max={1.2 * maxHit}
          onChange={(val) => setThresholdRange(val)}
        >
          <RangeSliderTrack bg="white.200">
            <RangeSliderFilledTrack bg="black.100" />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={5} index={0} bg={'black.100'}>
            <ParallelLine />
          </RangeSliderThumb>
          <RangeSliderThumb boxSize={5} index={1} bg={'black.100'}>
            <ParallelLine />
          </RangeSliderThumb>
        </RangeSlider>
      </Flex>
      <Box ref={ref} mt={'4'} overflowY={'scroll'} height={'50'}></Box>
    </Box>
  );
};

export default ThresholdMetric;
