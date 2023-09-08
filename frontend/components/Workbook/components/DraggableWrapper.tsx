import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Text,
} from '@chakra-ui/react';
import { SheetChartDetail, TransientSheetData } from '@lib/domain/workbook';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Column } from '@antv/g2plot';

import { Rnd } from 'react-rnd';
import { chartDataTransformer } from '../util';

export const CHART_COLOR = [
  '#3762BB',
  '#F1AB42',
  '#DD6054',
  '#65AC5A',
  '#9F4DB7',
];

const style: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f0f0f0',
  border: '1px solid blue',
  position: 'fixed',
  bottom: '200px',
  right: '20px',
  height: 200,
  width: 200,
  cursor: 'move',
};
export const SheetChart = ({
  chartData,
  updateChart,
  showChartPanel,
  hideChartPanel,
  sheetData,
}: {
  chartData: SheetChartDetail;
  updateChart: (timestamp: number, updatedChartData: SheetChartDetail) => void;
  sheetData: any;
  showChartPanel: (data: SheetChartDetail) => void;
  hideChartPanel: () => void;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const plot = useRef<{ chart: Column | null }>({ chart: null });
  useOnClickOutside(boxRef, (e: any) => {
    setIsActive(false);
  });
  const ref = useRef<HTMLDivElement>(null);
  const plotData = useMemo(() => {
    return chartDataTransformer(
      sheetData,
      chartData.xAxis[0]?.name,
      chartData.yAxis.map((axes) => axes.name)
    );
  }, [chartData.xAxis, chartData.yAxis, chartData.series, sheetData]);

  useEffect(() => {
    if (!plotData) return;

    const NUMBER_OF_COLUMNS = 30;
    const CALCULATED_END =
      NUMBER_OF_COLUMNS / plotData.length > 1
        ? 1
        : NUMBER_OF_COLUMNS / plotData.length;

    plot.current.chart = new Column(ref.current!!, {
      data: plotData,
      xField: 'x',
      yField: 'y',
      seriesField: 'series',
      autoFit: true,
      isGroup: true,
      slider: {
        start: 0,
        end: 1,
        formatter: (val, datum, index) => {
          console.log(datum, val);
          return index + 1;
        },
      },
      color: CHART_COLOR,
      xAxis: {
        label: {
          formatter: (text) => {
            return text.split('::').slice(1).join('');
          },
          rotate: (Math.PI * 7) / 4,
          offsetY: 10,
          offsetX: -10,
          style: {
            fontSize: 9,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fontSize: 9,
          },
        },
      },
      animation: false,
      tooltip: {
        title: (title) => {
          return title.split('::').slice(1).join('');
        },
      },
    });

    // plot.current.chart?.legend('y', { position: 'top' });

    plot.current.chart?.render();

    return () => {
      plot.current?.chart?.destroy();
    };
  }, [chartData.height, chartData.width, sheetData, plotData]);

  const updateName = (name: string) => {
    const newData = chartData;
    newData.name = name.length === 0 ? 'Untitled Chart' : name;
    updateChart(chartData.timestamp, newData);
  };

  return (
    <Rnd
      default={{
        x: chartData?.x || 50,
        y: chartData?.y || 50,
        width: chartData?.width || 722,
        height: chartData?.height || 435,
      }}
      style={{
        border: isActive ? '1px solid blue' : '1px solid #bdbdbd',
        background: 'white',
        borderRadius: '4px',
      }}
      onDragStop={(e, dragData) => {
        const { x, y } = dragData;
        const newData = chartData;
        newData.x = x;
        newData.y = y;
        updateChart(chartData.timestamp, newData);
      }}
      onResizeStop={(_, __, elem, ___, position) => {
        const newData = chartData;
        newData.height = elem.clientHeight;
        newData.width = elem.clientWidth;
        newData.x = position.x;
        newData.y = position.y;
        updateChart(chartData.timestamp, newData);
      }}
    >
      {isActive ? <ResizeMarker /> : null}
      <Flex
        w={'full'}
        h={'full'}
        ref={boxRef}
        onClick={() => {
          setIsActive(true);
          showChartPanel(chartData);
        }}
        px={13}
        py={6}
        flexDir={'column'}
      >
        <Editable
          onChange={updateName}
          defaultValue={chartData.name}
          fontSize={'20px'}
          fontWeight={600}
          lineHeight={'120%'}
          color={'grey.800'}
          pb={3}
          width={'fit-content'}
          borderRadius={0}
        >
          <EditablePreview cursor={'pointer'} />
          <EditableInput
            borderBottom={'2px'}
            borderBottomColor={'grey.400'}
            bg={'white.DEFAULT'}
            data-testid={'entity-name'}
            borderRadius={0}
          />
        </Editable>
        <Flex overflow={'hidden'} ref={ref} w={'full'} h={'full'}></Flex>
      </Flex>
    </Rnd>
  );
};

const ResizeMarker = () => (
  <>
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        top: '-2.5px',
        left: 0,
        right: 0,
        margin: 'auto',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        bottom: '-2.5px',
        left: 0,
        right: 0,
        margin: 'auto',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        left: '-2.5px',
        top: 0,
        bottom: 0,
        margin: 'auto',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        right: '-2.5px',
        top: 0,
        bottom: 0,
        margin: 'auto',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        top: '-2.5px',
        left: '-2.5px',
        cursor: 'cell',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        bottom: '-2.5px',
        right: '-2.5px',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        left: '-2.5px',
        bottom: '-2.5px',
      }}
    />
    <div
      style={{
        height: '5px',
        width: '5px',
        background: 'blue',
        position: 'absolute',
        right: '-2.5px',
        top: '-2.5px',
      }}
    />
  </>
);
