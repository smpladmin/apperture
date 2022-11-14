import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';
import { transformFunnelData } from '../util';

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
      height: 420,
    });

    plot.current.funnel.data(transformFunnelData(data).reverse());
    plot.current.funnel.scale('users', { nice: true });
    plot.current.funnel.coordinate().transpose();
    plot.current.funnel.tooltip({
      showMarkers: false,
    });
    plot.current.funnel
      .interval()
      .position('event*users')
      .label('conversion', {
        offset: 10,
        style: {
          fill: '#595959',
          fontSize: 12,
        },
      });
    plot.current.funnel.render();
  }, [data]);

  return <Box ref={ref}></Box>;
};

export default FunnelChart;
