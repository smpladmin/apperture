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
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';
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
      tooltip: {
        showMarkers: true,
        showCrosshairs: true,
        shared: true,
        formatter: ({ startDate, hits }) => {
          return {
            title: convertISODateToReadableDate(startDate),
            name: 'Hits',
            value: hits,
          };
        },
      },
      meta: {
        hits: {
          min: Math.floor(0.8 * minHit),
          max: Math.ceil(1.2 * maxHit),
        },
      },
      lineStyle: {
        stroke: BLUE,
      },
      animation: false,
    });
    plot.current.line?.render();
    return () => {
      plot.current.line?.destroy();
    };
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
            fontSize={{ base: 'xs-10', md: 'xs-14' }}
            lineHeight={{ base: 'xs-10', md: 'xs-14' }}
            fontWeight={{ base: 'normal', md: 'medium' }}
            color={'grey.100'}
          >
            Lower Bound
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'sh-20' }}
            lineHeight={{ base: 'xs-14', md: 'xs-14' }}
            fontWeight={'semibold'}
          >
            {formatDatalabel(thresholdRange?.[0])}
          </Text>
        </Flex>
        <Flex direction={'column'} gap={'1'}>
          <Text
            fontSize={{ base: 'xs-10', md: 'xs-14' }}
            lineHeight={{ base: 'xs-10', md: 'xs-14' }}
            fontWeight={{ base: 'normal', md: 'medium' }}
            color={'grey.100'}
          >
            Upper Bound
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'sh-20' }}
            lineHeight={{ base: 'xs-14', md: 'xs-14' }}
            fontWeight={'semibold'}
          >
            {formatDatalabel(thresholdRange?.[1])}
          </Text>
        </Flex>
      </Flex>
      <Flex mt={'2'} py={'4'} px={'2'}>
        <RangeSlider
          defaultValue={thresholdRange}
          min={Math.floor(0.8 * minHit)}
          max={Math.ceil(1.2 * maxHit)}
          onChange={(val) => setThresholdRange(val)}
        >
          <RangeSliderTrack bg="white.200">
            <RangeSliderFilledTrack bg="black.100" />
          </RangeSliderTrack>
          <RangeSliderThumb
            boxSize={{ base: '5', md: '6' }}
            index={0}
            bg={'black.100'}
          >
            <ParallelLine />
          </RangeSliderThumb>
          <RangeSliderThumb
            boxSize={{ base: '5', md: '6' }}
            index={1}
            bg={'black.100'}
          >
            <ParallelLine />
          </RangeSliderThumb>
        </RangeSlider>
      </Flex>
      <Box ref={ref} mt={'4'} overflowY={'scroll'} height={'50'}></Box>
    </Box>
  );
};

export default ThresholdMetric;
