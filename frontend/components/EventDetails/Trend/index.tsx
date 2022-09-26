import { Mix } from '@antv/g2plot';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TrendData } from '@lib/domain/eventData';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/graph';
import { useEffect, useRef } from 'react';

const Trend = ({ trendsData }: { trendsData: Array<TrendData> }) => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ trend: Mix | null }>({ trend: null });

  useEffect(() => {
    plot.current.trend = new Mix(ref.current!!, {
      autoFit: true,
    });
  }, []);

  useEffect(() => {
    plot.current.trend?.update({
      plots: [
        {
          type: 'area',
          region: {
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          },

          options: {
            data: trendsData,
            xField: 'startDate',
            yField: 'hits',
            seriesField: 'node',
            xAxis: {
              label: {
                formatter: (text) => {
                  return convertISODateToReadableDate(text);
                },
              },
            },
            yAxis: {
              label: {
                formatter: (text) => {
                  return formatDatalabel(Number(text));
                },
              },
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
            areaStyle: () => {
              return {
                fill: 'rgba(189, 230, 241, 1)',
                fillOpacity: 1,
              };
            },
            line: {
              style: { lineWidth: 1.5, stroke: 'rgba(189, 230, 241, 1)' },
            },
          },
        },
      ],
    });
    plot.current.trend?.render();
  }, [trendsData]);

  return (
    <Flex py={'6'} direction={'column'} gap={'4'}>
      <Text fontWeight={'medium'} fontSize={'sh-18'} lineHeight={'sh-18'}>
        Trend
      </Text>
      <Flex gap={'1'} alignItems={'center'}>
        <Box w={'3'} h={'3'} bg={'teal.100'} />
        <Text fontWeight={'normal'} fontSize={'xs-10'} lineHeight={'xs-10'}>
          Hits-Total
        </Text>
      </Flex>
      <Box ref={ref} height={'60'} pt={'4'} />
    </Flex>
  );
};

export default Trend;
