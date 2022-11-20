import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import { transformFunnelData } from '../util';
import { BLACK_200, MEDIUM_BLUE } from '@theme/index';
import { FunnelData } from '@lib/domain/funnel';
import { formatDatalabel } from '@lib/utils/common';

type FunnelChartProps = {
  data: FunnelData[];
};

const FunnelChart = ({ data }: FunnelChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ funnel: any }>({ funnel: null });
  const funnelData = transformFunnelData(data).reverse();

  useEffect(() => {
    plot.current.funnel = new Chart({
      container: ref.current!!,
      height: data.length * 120,
      autoFit: true,
      appendPadding: [0, 24, 0, 12],
    });

    plot.current.funnel.data(funnelData);
    plot.current.funnel.scale('users', { nice: true, alias: 'Users' });
    plot.current.funnel.tooltip({
      showMarkers: false,
    });
    plot.current.funnel.interval().position('event*users').color(MEDIUM_BLUE);

    funnelData.forEach((item) => {
      plot.current.funnel
        .annotation()
        .text({
          position: [item.event, item.users],
          content: formatDatalabel(item.users),
          style: {
            textAlign: 'left',
            fill: BLACK_200,
            fontSize: 12,
            fontWeight: 500,
          },
          offsetX: 8,
          offsetY: 8,
        })
        .text({
          position: [item.event, item.users],
          content: item.conversion.toFixed(1) + '%',
          style: {
            textAlign: 'left',
            fontWeight: 500,
            fill: BLACK_200,
            fontSize: 12,
          },
          offsetX: 8,
          offsetY: -8,
        });
    });

    plot.current.funnel.axis('users', {
      title: {
        offset: 40,
        style: {
          fontSize: 14,
          fill: BLACK_200,
          fontWeight: 500,
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

  return <Box ref={ref}></Box>;
};

export default FunnelChart;
