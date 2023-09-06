import { Flex } from '@chakra-ui/react';
import { SheetChartDetail } from '@lib/domain/workbook';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { CSSProperties, useRef, useState } from 'react';

import { Rnd } from 'react-rnd';

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
  data,
  updateChart,
}: {
  data: SheetChartDetail;
  updateChart: (timestamp: number, updatedChartData: SheetChartDetail) => void;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  useOnClickOutside(boxRef, () => setIsActive(false));

  return (
    <Rnd
      default={{
        x: data?.x || 50,
        y: data?.y || 50,
        width: data?.width || 722,
        height: data?.height || 435,
      }}
      style={{
        border: isActive ? '1px solid blue' : '1px solid #bdbdbd',
        background: 'white',
        borderRadius: '4px',
      }}
      onDragStop={(e, dragData) => {
        const { x, y } = dragData;
        const newData = data;
        newData.x = x;
        newData.y = y;
        updateChart(data.timestamp, newData);
      }}
      onResizeStop={(_, __, elem, ___, position) => {
        const newData = data;
        newData.height = elem.clientHeight;
        newData.width = elem.clientWidth;
        newData.x = position.x;
        newData.y = position.y;
        updateChart(data.timestamp, newData);
      }}
    >
      {isActive ? <ResizeMarker /> : null}
      <Flex
        w={'full'}
        h={'full'}
        ref={boxRef}
        onClick={() => setIsActive(true)}
        onKeyDown={(e) => {
          console.log(e);
        }}
      ></Flex>
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
