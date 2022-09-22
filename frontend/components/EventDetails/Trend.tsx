import { Mix } from '@antv/g2plot';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

const Trend = ({ trendsData }: { trendsData: any }) => {
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
            xField: 'week',
            yField: 'hits',
            seriesField: 'node',

            yAxis: {},
            tooltip: {
              showMarkers: true,
              showCrosshairs: true,
              shared: true,
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

  return <Box ref={ref} height={'60'} />;
};

export default Trend;
