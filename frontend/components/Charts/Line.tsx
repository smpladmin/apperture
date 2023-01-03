import React, { forwardRef } from 'react';
import { Line, LineOptions } from '@antv/g2plot';
import BaseChart, { BaseChartProps } from './Base';

export type LineChartProps = Omit<any, 'chart' | 'data'> & LineOptions;

const LineChart = forwardRef<HTMLDivElement | null, LineChartProps>(
  (props, ref) => {
    return <BaseChart chart={Line} ref={ref} {...props} />;
  }
);

export default LineChart;
