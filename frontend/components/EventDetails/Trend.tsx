import { Mix } from '@antv/g2plot';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { gaDataWithDate } from './data';

const data1 = gaDataWithDate.filter((item) => {
  return item.currentEvent == 'Login';
});

const Trend = ({ trendsData }: { trendsData: any }) => {
  useEffect(() => {
    const plot = new Mix('trend', {
      autoFit: false,
    });

    plot.update({
      plots: [
        {
          type: 'area',
          region: {
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0.5 },
          },
          options: {
            data: trendsData,
            xField: 'date',
            yField: 'hits',
            seriesField: 'currentEvent',

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
      //   views: [
      //     {
      //       data: data1,
      //       geometries: [
      //         {
      //           type: 'point',
      //           xField: 'date',
      //           yField: 'hits',
      //         },
      //       ],
      //       //   @ts-ignore
      //       annotations: [
      //         ...data1.map((d) => {
      //           return {
      //             type: 'line',
      //             start: [d.hits, 'min'],
      //             end: [d.hits, 'max'],
      //             top: false,
      //             style: {
      //               lineWidth: 2,
      //               radius: 2,
      //               lineDash: [2, 4],
      //               stroke: 'd9d9da',
      //             },
      //           };
      //         }),
      //       ],
      //     },
      //   ],
    });
    plot.render();
  }, [data1]);

  return <Box id="trend" />;
};

export default Trend;
