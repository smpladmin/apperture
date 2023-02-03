import React, {
  HTMLAttributes,
  forwardRef,
  useRef,
  useEffect,
  Ref,
  MutableRefObject,
  ReactElement,
  RefAttributes,
  useImperativeHandle,
  RefCallback,
} from 'react';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import { Box } from '@chakra-ui/react';

type PickedAttrs = 'className' | 'style';

type ChartConfig = Omit<any, 'data'>;

export interface Plot<C extends any> {
  new (container: HTMLElement, config: C): any;
}

const syncRef = <C extends any>(
  source: MutableRefObject<any | null>,
  target?: RefCallback<any | null> | MutableRefObject<any | null>
) => {
  if (typeof target === 'function') {
    target(source.current);
  } else if (target) {
    target.current = source.current;
  }
};

export interface BaseChartProps<C extends any>
  extends Pick<HTMLAttributes<HTMLDivElement>, PickedAttrs> {
  /**
   * Plot Class
   * @note Internal use, should not use directly
   */
  chart: Plot<C>;
  /**
   * Plot Ref
   */
  chartRef?: RefCallback<any | null> | MutableRefObject<any | null>;
  data?: Record<string, any> | Record<string, any>[];
  onReady?: (plot: any) => void;
}

const BaseChart = <C extends any>(
  props: BaseChartProps<C>,
  ref?: Ref<HTMLDivElement | null>
) => {
  const {
    chart: Chart,
    style,
    className,
    chartRef: chart,
    onReady,
    ...restProps
  } = props;
  const chartRef = useRef<any | null>(null);
  const configRef = useRef<ChartConfig>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef<boolean>(true);
  const dataRef = useRef<Record<string, any>[]>([]);

  useImperativeHandle(ref, () => containerRef.current);

  useEffect(() => {
    const { current: container } = containerRef;

    if (container) {
      const { data, ...config } = restProps as any;
      configRef.current = cloneDeep(config);
      const normalizedData = data || [];
      dataRef.current = normalizedData;
      const mergedConfig = {
        ...config,
        data: normalizedData,
      } as any;
      chartRef.current = new Chart(container, mergedConfig);
      chartRef.current.render();
    }
    syncRef(chartRef, chart);
    if (chartRef.current) {
      onReady?.(chartRef.current);
    }
    return () => {
      if (chartRef.current && chartRef.current.destroy) {
        chartRef.current.destroy();
        chartRef.current = null;
        syncRef(chartRef, chart);
      }
    };
  }, []);

  useEffect(() => {
    const { current: chart } = chartRef;

    if (chart) {
      // avoid update in first time
      if (!isFirstRenderRef.current) {
        const { data, ...config } = restProps as any;
        const normalizedData = data || [];
        if (!isEqual(config, configRef.current) || isEmpty(dataRef.current)) {
          configRef.current = cloneDeep(config);
          const mergedConfig = {
            ...config,
            data: normalizedData,
          };

          chart.update(mergedConfig as any);
          chart.render();
        } else if (chart.changeData) {
          chart.changeData(normalizedData);
        }
        dataRef.current = normalizedData;
      } else {
        isFirstRenderRef.current = false;
      }
    }
  }, [restProps]);

  return <Box width={'full'} className={className} ref={containerRef} />;
};

export default forwardRef(BaseChart) as <C extends any>(
  p: BaseChartProps<C> & RefAttributes<HTMLDivElement | null>
) => ReactElement;
