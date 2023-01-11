import { Box, useDisclosure } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Chart } from '@antv/g2';
import { transformFunnelData } from '../util';
import { BLACK_200, MEDIUM_BLUE } from '@theme/index';
import { FunnelData } from '@lib/domain/funnel';
import { formatDatalabel } from '@lib/utils/common';
import { AppertureContext } from '@lib/contexts/appertureContext';
import usePrevious from '@lib/hooks/usePrevious';
import isEqual from 'lodash/isEqual';

type FunnelChartProps = {
  data: FunnelData[];
  handleChartClick: Function;
};

const FunnelChart = ({ data, handleChartClick }: FunnelChartProps) => {
  const {
    device: { isMobile },
  } = useContext(AppertureContext);

  const CONTAINER_HEIGHT = isMobile ? data?.length * 80 : data?.length * 100;
  const LABEL_FONT_SIZE = isMobile ? 10 : 12;
  const AXIS_FONT_SIZE = isMobile ? 10 : 14;

  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ funnel: any }>({ funnel: null });
  const funnelData = transformFunnelData(data)?.reverse();
  const previousData = usePrevious(funnelData);

  useEffect(() => {
    if (isEqual(previousData, funnelData)) return;

    plot.current.funnel = new Chart({
      container: ref.current!!,
      height: CONTAINER_HEIGHT,
      autoFit: true,
      appendPadding: [0, 24, 0, 0],
    });
    plot.current.funnel.on('element:click', handleChartClick);
    plot.current.funnel.data(funnelData);
    plot.current.funnel.scale('users', { nice: true, alias: 'Users' });
    plot.current.funnel.tooltip({
      showMarkers: false,
      customContent: (_: any, data: any) => {
        const stats = data?.length ? data[0] : null;
        if (stats) {
          const { users, drop } = stats.data;
          return `<div id='funnel-tooltip' class='tooltip funnel' 
          >
            <span class='heading'>Checkout</span>
            <div class='stats'>
              <div class='row'>
              <span class='title'> Converted </span>
              <span class='data'> ${formatDatalabel(users)} </span>
              </div>
              <div class='row'>
              <span class='title'> Dropped </span>
              <span class='data'> ${formatDatalabel(drop)} </span>
              </div>
              <span class='action-button'> click here to view list</span>
            </div>
         </div>`;
        }
        return '';
      },
      follow: true,
    });
    plot.current.funnel.interval().position('event*users').color(MEDIUM_BLUE);

    funnelData?.forEach((item) => {
      plot.current.funnel
        .annotation()
        .text({
          position: [item.event, item.users],
          content: formatDatalabel(item.users),
          style: {
            textAlign: 'left',
            fill: BLACK_200,
            fontSize: LABEL_FONT_SIZE,
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
            fontSize: LABEL_FONT_SIZE,
            fontWeight: 500,
            fill: BLACK_200,
          },
          offsetX: 8,
          offsetY: -8,
        });
    });

    plot.current.funnel.axis('users', {
      title: {
        offset: 40,
        style: {
          fontSize: AXIS_FONT_SIZE,
          fill: BLACK_200,
          fontWeight: 500,
        },
      },
    });
    plot.current.funnel.axis('event', {
      label: {
        style: {
          fontSize: AXIS_FONT_SIZE,
          fontWeight: 500,
          fill: BLACK_200,
        },
      },
    });

    plot.current.funnel.coordinate().transpose();
    plot.current.funnel.render();
  }, [data]);

  return (
    <Box className="funnel-chart" ref={ref} data-testid={'funnel-chart'}></Box>
  );
};

export default FunnelChart;
