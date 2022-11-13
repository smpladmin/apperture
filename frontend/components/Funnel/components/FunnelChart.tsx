import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { Chart, registerTheme } from '@antv/g2';
import { data } from '../data';

const FunnelChart = () => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ funnel: any }>({ funnel: null });

  useEffect(() => {
    plot.current.funnel = new Chart({
      container: ref.current!!,
      autoFit: true,
      height: 420,
    });

    plot.current.funnel.data(data.reverse());
    plot.current.funnel.scale('value', { nice: true });
    plot.current.funnel.coordinate().transpose();
    plot.current.funnel.tooltip({
      showMarkers: false,
    });
    plot.current.funnel.axis('event', {
      label: {
        formatter: ({ text }: any) => {
          console.log('hi', text);
          return text;
        },
      },
    });
    plot.current.funnel.axis('event', {});
    plot.current.funnel
      .interval()
      .position('event*value')
      .label('percentage', {
        offset: 10,
        style: {
          fill: '#595959',
          fontSize: 12,
        },
      });
    plot.current.funnel.render();
  }, []);

  //   useEffect(() => {});
  return <Box ref={ref}></Box>;
};

export default FunnelChart;
