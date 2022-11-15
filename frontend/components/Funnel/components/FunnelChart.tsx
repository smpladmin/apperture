import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import { transformFunnelData } from '../util';
import { BLACK_200, GRAY_100, MEDIUM_BLUE } from '@theme/index';

type FunnelChartProps = {
  data: any[];
};

const FunnelChart = ({ data }: FunnelChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ funnel: any }>({ funnel: null });

  useEffect(() => {
    plot.current.funnel = new Chart({
      container: ref.current!!,
      autoFit: true,
      padding: [28, 44, 52, 108],
      limitInPlot: true,
    });

    plot.current.funnel.data(transformFunnelData(data).reverse());
    plot.current.funnel.scale('users', { nice: true, alias: 'Users' });
    plot.current.funnel.tooltip({
      showMarkers: false,
    });
    plot.current.funnel.interval().position('event*users').color(MEDIUM_BLUE);

    transformFunnelData(data)
      .reverse()
      .forEach((item, i) => {
        console.log(i);
        plot.current.funnel
          .annotation()
          .text({
            position: [item.event, item.users],
            content: item.users,
            style: {
              textAlign: 'left',
              fill: GRAY_100,
              fontSize: 12,
              fontWeight: 500,
            },
            offsetX: 8,
            offsetY: 6,
          })
          .text({
            position: [item.event, item.users],
            content: item.conversion.toFixed(1) + '%',
            style: {
              textAlign: 'left',
              fontWeight: 700,
              fill: BLACK_200,
              fontSize: 12,
            },
            offsetX: 8,
            offsetY: -6,
          });
      });

    plot.current.funnel.axis('users', {
      title: {
        offset: 40,
        style: {
          fontSize: 18,
          fontWeight: 700,
        },
      },
    });
    plot.current.funnel.axis('event', {
      label: {
        style: {
          fontSize: 14,
          fontWeight: 500,
          fill: BLACK_200,
        },
      },
    });

    plot.current.funnel.coordinate().transpose();
    plot.current.funnel.render();
  }, [data]);

  return <Box ref={ref} paddingX={'4'} height={'125'} overflow={'auto'}></Box>;
};

export default FunnelChart;
