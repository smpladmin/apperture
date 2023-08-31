import { CSSProperties, useRef } from 'react';

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
export const DraggableWrapper = () => {
  return (
    <Rnd
      default={{
        x: 50,
        y: 50,
        width: 320,
        height: 200,
      }}
      style={{
        border: '1px solid blue',
        background: 'white',
      }}
    >
      <div
        style={{
          height: '5px',
          width: '5px',
          background: 'blue',
          position: 'absolute',
          top: '-2.5px',
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
        }}
      />
      <div
        style={{
          height: '5px',
          width: '5px',
          background: 'blue',
          position: 'absolute',
          left: '-2.5px',
        }}
      />
      <div
        style={{
          height: '5px',
          width: '5px',
          background: 'blue',
          position: 'absolute',
          right: '-2.5px',
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
    </Rnd>
  );
};
