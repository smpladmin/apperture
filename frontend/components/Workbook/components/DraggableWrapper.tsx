import { Flex } from '@chakra-ui/react';
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
export const SheetChart = ({ x = 50, y = 50, height = 722, width = 435 }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  useOnClickOutside(boxRef, () => setIsActive(false));

  return (
    <Rnd
      default={{
        x: 50,
        y: 50,
        width: 722,
        height: 435,
      }}
      style={{
        border: isActive ? '1px solid blue' : '1px solid #bdbdbd',
        background: 'white',
        borderRadius: '4px',
      }}
      onDragStop={(e, data) => {
        const { x, y } = data;
        console.log({ x, y });
      }}
      onResizeStop={(e) => {
        console.log(e);
      }}
    >
      {isActive ? <ResizeMarker /> : null}
      <Flex
        w={'full'}
        h={'full'}
        ref={boxRef}
        onClick={() => setIsActive(true)}
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
